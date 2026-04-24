import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ActivoPoseidoConPrecio, NuevaPosition } from '@/lib/types'

// GET /api/activos
// Devuelve las posiciones del usuario con el precio actual de cada activo
// (join: activosposeidos → activos → último valorhistoricoactivo)
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // 1. Obtener posiciones con info del activo
  const { data: posiciones, error } = await supabase
    .from('activosposeidos')
    .select(`
      usuario_id,
      activocodigo,
      cantidad,
      fechainicio,
      precio_compra,
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!posiciones || posiciones.length === 0) return NextResponse.json([])

  // 2. Para cada activo, obtener el precio más reciente de valorhistoricoactivo
  const codigos = posiciones.map(p => p.activocodigo)

  const { data: historicos } = await supabase
    .from('valorhistoricoactivo')
    .select('activocodigo, fecha, valor')
    .in('activocodigo', codigos)
    .order('fecha', { ascending: false })

  // Quedarse con el precio más reciente de cada activo
  const precioActual: Record<number, number> = {}
  for (const h of historicos ?? []) {
    if (!(h.activocodigo in precioActual)) {
      precioActual[h.activocodigo] = Number(h.valor)
    }
  }


  // 3. Combinar y calcular valores derivados
  const resultado: ActivoPoseidoConPrecio[] = posiciones.map(p => {
    const precio = precioActual[p.activocodigo] ?? 0
    const valorTotal = p.cantidad * precio
    const simbolo    = p.activos?.divisas?.simbolo_divisa
    const rentabilidad = p.precio_compra > 0
      ? ((precio - p.precio_compra) / p.precio_compra) * 100
      : 0

    return {
      ...p,
      simbolo_divisa: simbolo,
      precio_actual: precio,
      valor_total: Math.round(valorTotal * 100) / 100,
      rentabilidad_pct: Math.round(rentabilidad * 100) / 100,
    } as ActivoPoseidoConPrecio
  })

  return NextResponse.json(resultado)
}

// POST /api/activos
// Añade un activo del catálogo a la cartera del usuario (inserta en activosposeidos)
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body: NuevaPosition = await request.json()

  const { data, error } = await supabase
    .from('activosposeidos')
    .upsert({
      usuario_id:    user.id,
      activocodigo:  body.activocodigo,
      cantidad:      body.cantidad,
      fechainicio:   body.fechainicio ?? new Date().toISOString().split('T')[0],
      precio_compra: body.precio_compra ?? 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
