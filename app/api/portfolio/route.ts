import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertirDivisa } from '@/app/api/cambios/route'
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
      activos (
        descripcion,
        tipocodigo,
        divisacodigo (codigo, simbolo_divisa),
        color,
        tiposactivos ( descripcion )
      ),
      perfiles ( divisabasecodigo (codigo, simbolo_divisa)) )
    `)
    .eq('usuario_id', user.id)
  console.log('Usuario recibido')
  if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
  }
  console.log('Usuario recibido con exito')
  if (!posiciones || posiciones.length === 0) {
    return NextResponse.json({
      patrimonio_total: 0,
      distribucion: [],
      mejor_activo: null,
    } satisfies ResumenPortfolio)
  }

  // 1.5 separamos la divisa que desea el cliente
  const perfil = posiciones[0].perfiles as any
  const divisaFinal = perfil?.divisabasecodigo?.codigo
  const simboloDivisa = perfil?.divisabasecodigo?.simbolo_divisa

  // 2. Precio actual de cada activo (último valor histórico)
  const codigos = posiciones.map(p => p.activocodigo)

  const { data: historicos } = await supabase
    .from('valorhistoricoactivo')
    .select(`activocodigo, valor, fecha,
            activos (divisacodigo
                  )`)
    .in('activocodigo', codigos)
    .order('fecha', { ascending: false })

const precioActual: Record<number, number> = {}

for (const h of historicos ?? []) {
  if (!(h.activocodigo in precioActual)) {
    const activo = h.activos as any
    const divisaActivo = activo?.divisacodigo

   try {
     if (divisaActivo === divisaFinal) {
       precioActual[h.activocodigo] = Number(h.valor)
     } else {
       precioActual[h.activocodigo] = await convertirDivisa(
         Number(h.valor),
         divisaActivo,
         divisaFinal,
         h.fecha
       )
     }
   } catch (e) {
     console.error('Error convirtiendo:', h, e)
     precioActual[h.activocodigo] = 0 // 🔥 evita romper todo
   }
  }
}

  // 3. Patrimonio total
  const patrimonio_total = posiciones.reduce((sum, p) => {
    const precio = precioActual[p.activocodigo] ?? 0
    return sum + p.cantidad * precio
  }, 0)

  // 4. Distribución por tipo de activo (usando descripcion de tiposactivos)
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

  // 5. Mejor activo por rentabilidad
  const conRentabilidad = posiciones
    .filter(p => p.precio_compra > 0)
    .map(p => {
      const precio = precioActual[p.activocodigo] ?? 0
      const activo = p.activos as any
      return {
        descripcion: activo?.descripcion ?? String(p.activocodigo),
        codigo: p.activocodigo,
        rentabilidad_pct: Math.round(((precio - p.precio_compra) / p.precio_compra) * 10000) / 100,
      }
    })

  const mejor_activo = conRentabilidad.length > 0
    ? conRentabilidad.reduce((best, a) => a.rentabilidad_pct > best.rentabilidad_pct ? a : best)
    : null

  return NextResponse.json({
    simboloDivisa,
    patrimonio_total: Math.round(patrimonio_total * 100) / 100,
    distribucion,
    mejor_activo,
  } satisfies ResumenPortfolio)

}
