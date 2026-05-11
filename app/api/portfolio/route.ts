import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ResumenPortfolio } from '@/lib/types'

// GET /api/portfolio
// Calcula el resumen financiero del usuario a partir de activosposeidos + valorhistoricoactivo
// Valores se presentan en la divisa de preferencia del usuario
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // 1. Posiciones del usuario con info del tipo de activo
  const { data: posiciones, error } = await supabase
    .from('activosposeidos')
    .select(`
      activocodigo,
      cantidad,
      precio_compra,
      fechainicio,
      activos (
        descripcion,
        tipocodigo,
        divisacodigo (codigo, simbolo_divisa),
        color,
        tiposactivos ( descripcion )
      ),
      perfiles ( divisabasecodigo (codigo, simbolo_divisa) )
    `)
    .eq('usuario_id', user.id)

  if (error) {
    console.error('portfolio GET:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!posiciones || posiciones.length === 0) {
    return NextResponse.json({
      simboloDivisa: '€',
      patrimonio_total: 0,
      distribucion: [],
      mejor_activo: null,
    } satisfies ResumenPortfolio)
  }

  const perfil = posiciones[0].perfiles as any
  const divisaFinal = perfil?.divisabasecodigo?.codigo as string | undefined
  const simboloDivisa = perfil?.divisabasecodigo?.simbolo_divisa as string | undefined

  const codigos = posiciones.map(p => p.activocodigo)

  // 2. Precio más reciente de cada activo — BUG FIX: limit a N+10 filas (ordenado DESC)
  //    En lugar de traer 5 años de histórico, solo necesitamos el último precio por activo.
  //    Con ORDER BY fecha DESC y la guarda `if (!(h.activocodigo in precioActual))`,
  //    añadir un límite razonable evita traer miles de filas innecesarias.
  const { data: historicos } = await supabase
    .from('valorhistoricoactivo')
    .select('activocodigo, valor, fecha')
    .in('activocodigo', codigos)
    .order('fecha', { ascending: false })
    .limit(codigos.length * 10)

  // 3. Tipos de cambio en UNA query (BUG FIX: antes había N awaits secuenciales)
  const divisasActivos = [...new Set(
    posiciones
      .map(p => (p.activos as any)?.divisacodigo?.codigo as string)
      .filter(Boolean)
  )]

  const rateCache: Record<string, number> = {}

  if (divisaFinal) {
    const divisasAConvertir = divisasActivos.filter(d => d !== divisaFinal)
    if (divisasAConvertir.length > 0) {
      const hoy = new Date().toISOString().split('T')[0]
      const { data: cambios } = await supabase
        .from('cambios')
        .select('divisaorigen, cambio')
        .in('divisaorigen', divisasAConvertir)
        .eq('divisadestino', divisaFinal)
        .lte('fecini', hoy)
        .order('fecini', { ascending: false })

      for (const c of cambios ?? []) {
        if (!(c.divisaorigen in rateCache)) rateCache[c.divisaorigen] = Number(c.cambio)
      }
    }
  }

  // 4. Construir mapa precio actual (en divisa del usuario)
  const precioActual: Record<number, number> = {}

  for (const h of historicos ?? []) {
    if (h.activocodigo in precioActual) continue
    const activo = posiciones.find(p => p.activocodigo === h.activocodigo)?.activos as any
    const divisaActivo = activo?.divisacodigo?.codigo as string | undefined
    const tasa = divisaActivo && divisaFinal && divisaActivo !== divisaFinal
      ? (rateCache[divisaActivo] ?? 1)
      : 1
    precioActual[h.activocodigo] = Number(h.valor) * tasa
  }

  // EFECTIVO: valor = 1 en su divisa nativa, convertido con rateCache
  for (const p of posiciones) {
    const activo = p.activos as any
    if (activo?.tipocodigo !== 'EFECTIVO') continue
    const divisaActivo = activo?.divisacodigo?.codigo as string | undefined
    const tasa = divisaActivo && divisaFinal && divisaActivo !== divisaFinal
      ? (rateCache[divisaActivo] ?? 1)
      : 1
    precioActual[p.activocodigo] = 1 * tasa
  }

  // 5. Patrimonio total
  const patrimonio_total = posiciones.reduce((sum, p) => {
    const precio = precioActual[p.activocodigo] ?? 0
    return sum + p.cantidad * precio
  }, 0)

  // 6. Distribución por tipo de activo
  const porTipo: Record<string, { valor: number; color: string }> = {}

  for (const p of posiciones) {
    const precio = precioActual[p.activocodigo] ?? 0
    const valor = p.cantidad * precio
    const activo = p.activos as any
    const tipoDesc = activo?.tiposactivos?.descripcion ?? activo?.tipocodigo ?? 'Otro'
    const color = activo?.color ?? '#6366f1'

    if (!porTipo[tipoDesc]) porTipo[tipoDesc] = { valor: 0, color }
    porTipo[tipoDesc].valor += valor
  }

  const distribucion = Object.entries(porTipo).map(([nombre, { valor, color }]) => ({
    nombre,
    valor: Math.round(valor * 100) / 100,
    porcentaje: patrimonio_total > 0
      ? Math.round((valor / patrimonio_total) * 1000) / 10
      : 0,
    color,
  }))

  // 7. Precio de compra efectivo (histórico en fechainicio si precio_compra = 0)
  const precioCompraEfectivo: Record<number, number> = {}
  for (const p of posiciones) precioCompraEfectivo[p.activocodigo] = p.precio_compra

  const sinPrecio = posiciones.filter(p => !p.precio_compra && (p as any).fechainicio)
  if (sinPrecio.length > 0) {
    const codigosSin = [...new Set(sinPrecio.map(p => p.activocodigo))]
    const fechaMin = sinPrecio.map(p => (p as any).fechainicio as string).sort()[0]

    const { data: historicoCompra } = await supabase
      .from('valorhistoricoactivo')
      .select('activocodigo, fecha, valor')
      .in('activocodigo', codigosSin)
      .gte('fecha', fechaMin)
      .order('fecha', { ascending: true })

    for (const p of sinPrecio) {
      const fechaInicio = (p as any).fechainicio as string
      const rows = (historicoCompra ?? []).filter(
        (h: { activocodigo: number; fecha: string; valor: unknown }) =>
          h.activocodigo === p.activocodigo && h.fecha <= fechaInicio
      )
      const precio = rows.length > 0
        ? Number(rows[rows.length - 1].valor)
        : Number((historicoCompra ?? []).find(
            (h: { activocodigo: number }) => h.activocodigo === p.activocodigo
          )?.valor ?? 0)
      if (precio > 0) precioCompraEfectivo[p.activocodigo] = precio
    }
  }

  // 8. Mejor activo por rentabilidad (usa precio histórico cuando precio_compra = 0)
  const conRentabilidad = posiciones
    .filter(p => (precioActual[p.activocodigo] ?? 0) > 0)
    .map(p => {
      const precioActualPos = precioActual[p.activocodigo] ?? 0
      const activo = p.activos as any
      const divisaActivo = activo?.divisacodigo?.codigo as string | undefined
      const tasa = divisaActivo && divisaFinal && divisaActivo !== divisaFinal
        ? (rateCache[divisaActivo] ?? 1) : 1
      const precioCompraConvertido = precioCompraEfectivo[p.activocodigo] * tasa
      return {
        descripcion: activo?.descripcion ?? String(p.activocodigo),
        codigo: p.activocodigo,
        rentabilidad_pct: precioCompraConvertido > 0
          ? Math.round(((precioActualPos - precioCompraConvertido) / precioCompraConvertido) * 10000) / 100
          : 0,
      }
    })
    .filter(p => p.rentabilidad_pct !== 0)

  const mejor_activo = conRentabilidad.length > 0
    ? conRentabilidad.reduce((best, a) => a.rentabilidad_pct > best.rentabilidad_pct ? a : best)
    : null

  return NextResponse.json({
    divisaFinal,
    simboloDivisa: simboloDivisa ?? '€',
    patrimonio_total: Math.round(patrimonio_total * 100) / 100,
    distribucion,
    mejor_activo,
  } satisfies ResumenPortfolio)
}
