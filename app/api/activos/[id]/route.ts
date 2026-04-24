import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ActivoPoseidoConPrecio } from '@/lib/types'

// GET /api/activos/[id]   (id = activocodigo)
// Devuelve la posición del usuario en un activo concreto, con precio actual
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const activocodigo = parseInt(id)
  if (isNaN(activocodigo)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const { data: posicion, error } = await supabase
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
        divisacodigo,
        color,
        simbolo,
        tiposactivos ( codigo, descripcion, riesgocodigo )
      )
    `)
    .eq('usuario_id', user.id)
    .eq('activocodigo', activocodigo)
    .single()

  if (error) return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })

  // Precio más reciente
  const { data: historico } = await supabase
    .from('valorhistoricoactivo')
    .select('valor, fecha')
    .eq('activocodigo', activocodigo)
    .order('fecha', { ascending: false })
    .limit(7) // últimos 7 días para el gráfico

  const precioActual = historico && historico.length > 0 ? Number(historico[0].valor) : 0
  const valorTotal = posicion.cantidad * precioActual
  const rentabilidad = posicion.precio_compra > 0
    ? ((precioActual - posicion.precio_compra) / posicion.precio_compra) * 100
    : 0

  return NextResponse.json({
    ...posicion,
    precio_actual: precioActual,
    valor_total: Math.round(valorTotal * 100) / 100,
    rentabilidad_pct: Math.round(rentabilidad * 100) / 100,
    historico: historico ?? [],
  } as ActivoPoseidoConPrecio & { historico: { valor: number; fecha: string }[] })
}

// DELETE /api/activos/[id]   (id = activocodigo)
// Elimina un activo de la cartera del usuario
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const activocodigo = parseInt(id)
  if (isNaN(activocodigo)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const { error } = await supabase
    .from('activosposeidos')
    .delete()
    .eq('usuario_id', user.id)
    .eq('activocodigo', activocodigo)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
