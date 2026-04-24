import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ResumenPortfolio } from '@/lib/types'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Reescribir todo para ir con una sola llamada, comentar con el equipo
    const { data, error } = await supabase
      .rpc('resumen_portfolio', { user_id: user.id })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        patrimonio_total: 0,
        distribucion: [],
        mejor_activo: null,
      } satisfies ResumenPortfolio)
    }

    // 💰 Patrimonio total
    const patrimonio_total = data.reduce((sum, a) => sum + Number(a.valor_actual), 0)

    // 📊 Distribución
    const porTipo: Record<string, { valor: number; color: string }> = {}

    for (const a of data) {
      const tipo = a.tipodescripcion ?? 'Otro'
      if (!porTipo[tipo]) {
        porTipo[tipo] = { valor: 0, color: a.color ?? '#6366f1' }
      }
      porTipo[tipo].valor += Number(a.valor_actual)
    }

    const distribucion = Object.entries(porTipo).map(([nombre, { valor, color }]) => ({
      nombre,
      valor: Math.round(valor * 100) / 100,
      porcentaje: patrimonio_total > 0
        ? Math.round((valor / patrimonio_total) * 1000) / 10
        : 0,
      color,
    }))

    // 🏆 Mejor activo
    const conRentabilidad = data
      .filter(a => Number(a.precio_compra) > 0)
      .map(a => ({
        descripcion: a.descripcion,
        codigo: a.activocodigo,
        rentabilidad_pct:
          Math.round(
            ((Number(a.precio_actual) - Number(a.precio_compra)) /
              Number(a.precio_compra)) * 10000
          ) / 100,
      }))

    const mejor_activo =
      conRentabilidad.length > 0
        ? conRentabilidad.reduce((best, a) =>
            a.rentabilidad_pct > best.rentabilidad_pct ? a : best
          )
        : null

    return NextResponse.json({
      patrimonio_total: Math.round(patrimonio_total * 100) / 100,
      distribucion,
      mejor_activo,
    } satisfies ResumenPortfolio)

  } catch (e) {
    return NextResponse.json({
      patrimonio_total: 0,
      distribucion: [],
      mejor_activo: null,
      error: 'Error interno',
    }, { status: 500 })
  }
}
