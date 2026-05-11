import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { regenerarRecomendacionesUsuario } from '@/lib/server/regenerarRecomendaciones'
import type { ActivoPoseidoConPrecio, NuevaPosition } from '@/lib/types'

// GET /api/activos -> Listar todos los activos del usuario
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // 1. Posiciones con info del activo
  const { data: posiciones, error } = await supabase
    .from('activosposeidos')
    .select(`
      perfiles(id, divisas(codigo, simbolo_divisa)),
      usuario_id,
      activocodigo,
      cantidad,
      fechainicio,
      precio_compra,
      id,
      activos (
        codigo,
        descripcion,
        tipocodigo,
        divisas (codigo, simbolo_divisa),
        color,
        simbolo,
        tiposactivos ( codigo, descripcion, riesgocodigo )
      )
    `)
    .eq('usuario_id', user.id)

  if (error) {
    console.log('En activos: ' + error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!posiciones || posiciones.length === 0) return NextResponse.json([])

  // 2. Precio más reciente de cada activo (una sola query)
  const codigos = posiciones.map(p => p.activocodigo)
  // BUG FIX: limitar a N×10 filas — solo necesitamos el precio más reciente por activo
  const { data: historicos } = await supabase
    .from('valorhistoricoactivo')
    .select('activocodigo, fecha, valor')
    .in('activocodigo', codigos)
    .order('fecha', { ascending: false })
    .limit(codigos.length * 10)

  const precioActual: Record<number, number> = {}
  for (const h of historicos ?? []) {
    if (!(h.activocodigo in precioActual)) precioActual[h.activocodigo] = Number(h.valor)
  }
  for (const p of posiciones) {
    if ((p.activos as any)?.tipocodigo === 'EFECTIVO') precioActual[p.activocodigo] = 1
  }

  // 2.5. Para posiciones sin precio_compra, buscar precio histórico en fechainicio
  const posicionesSinPrecio = posiciones.filter(p => !p.precio_compra && p.fechainicio)
  const precioEnCompra: Record<number, number> = {} // clave: posicion.id

  if (posicionesSinPrecio.length > 0) {
    const codigosSinPrecio = [...new Set(posicionesSinPrecio.map(p => p.activocodigo))]
    const fechaMin = posicionesSinPrecio.map(p => p.fechainicio!).sort()[0]

    const { data: historicosCompra } = await supabase
      .from('valorhistoricoactivo')
      .select('activocodigo, fecha, valor')
      .in('activocodigo', codigosSinPrecio)
      .gte('fecha', fechaMin)
      .order('fecha', { ascending: true })

    for (const pos of posicionesSinPrecio) {
      const candidatos = (historicosCompra ?? [])
        .filter(h => h.activocodigo === pos.activocodigo && h.fecha <= pos.fechainicio!)
      if (candidatos.length > 0) {
        precioEnCompra[pos.id as number] = Number(candidatos[candidatos.length - 1].valor)
      } else {
        const primero = (historicosCompra ?? []).find(h => h.activocodigo === pos.activocodigo)
        if (primero) precioEnCompra[pos.id as number] = Number(primero.valor)
      }
    }
  }

  // 3. Tipos de cambio en UNA query (todos los pares necesarios)
  const divisaUsuario = (posiciones[0].perfiles as any)?.divisas?.codigo as string | undefined
  const simboloDivisa = (posiciones[0].perfiles as any)?.divisas?.simbolo_divisa as string | undefined

  const divisasActivos = [...new Set(
    posiciones.map(p => (p.activos as any)?.divisas?.codigo as string).filter(Boolean)
  )]

  // Si el usuario tiene divisa y hay conversiones necesarias, traer tasas
  const rateCache: Record<string, number> = {}

  if (divisaUsuario) {
    const divisasAConvertir = divisasActivos.filter(d => d !== divisaUsuario)
    if (divisasAConvertir.length > 0) {
      const hoy = new Date().toISOString().split('T')[0]
      const { data: cambios } = await supabase
        .from('cambios')
        .select('divisaorigen, cambio')
        .in('divisaorigen', divisasAConvertir)
        .eq('divisadestino', divisaUsuario)
        .lte('fecini', hoy)
        .order('fecini', { ascending: false })

      // Tomar la tasa más reciente de cada par (ya ordenado desc)
      for (const c of cambios ?? []) {
        if (!(c.divisaorigen in rateCache)) rateCache[c.divisaorigen] = Number(c.cambio)
      }
    }
  }

  // 4. Combinar y calcular (todo en memoria, sin más queries)
  const resultado: ActivoPoseidoConPrecio[] = posiciones.map((p) => {
    const divisaActivo = (p.activos as any)?.divisas?.codigo as string | undefined
    const tasa = divisaActivo && divisaUsuario && divisaActivo !== divisaUsuario
      ? (rateCache[divisaActivo] ?? 1)
      : 1

    const precioBase = precioActual[p.activocodigo] ?? 0
    const precio = precioBase * tasa
    const precioCompraBase = p.precio_compra || precioEnCompra[p.id as number] || 0
    const precioCompraConvertido = precioCompraBase * tasa
    const valorTotal = p.cantidad * precio
    const rentabilidad = precioCompraConvertido > 0
      ? ((precio - precioCompraConvertido) / precioCompraConvertido) * 100
      : 0

    return {
      ...p,
      precio_compra: Math.round(precioCompraConvertido * 100) / 100,
      simbolo_divisa: simboloDivisa,
      precio_actual: Math.round(precio * 100) / 100,
      valor_total: Math.round(valorTotal * 100) / 100,
      rentabilidad_pct: Math.round(rentabilidad * 100) / 100,
    } as unknown as ActivoPoseidoConPrecio
  })

  return NextResponse.json(resultado)
}

// POST /api/activos -> Crear una nueva posición
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body: NuevaPosition = await request.json()

  const { data, error } = await supabase
    .from('activosposeidos')
    .upsert({
      usuario_id: user.id,
      activocodigo: Number(body.activocodigo),
      cantidad: Number(body.cantidad),
      fechainicio: body.fechainicio || new Date().toISOString().split('T')[0],
      precio_compra: Number(body.precio_compra) || 0,
    })
    .select()
    .single()

  if (error) {
    console.log('En activos: ' + error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  regenerarRecomendacionesUsuario(user.id).catch(() => {})

  return NextResponse.json(data, { status: 201 })
}
