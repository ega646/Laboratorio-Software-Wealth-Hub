import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ActivoPoseidoConPrecio } from '@/lib/types'

// GET /api/activos/[id] -> Detalles y cálculos de un activo
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const activoCodigo = parseInt(id)

  // 1. Obtener posiciones y datos del activo
  const { data: posiciones, error: errorPos } = await supabase
    .from('activosposeidos')
    .select(`
      activocodigo, cantidad, precio_compra, fechainicio,
      activos (
        codigo, descripcion, tipocodigo, divisacodigo, color, simbolo,
        tiposactivos ( codigo, descripcion, riesgocodigo )
      )
    `)
    .eq('usuario_id', user.id)
    .eq('activocodigo', activoCodigo)

  if (errorPos || !posiciones || posiciones.length === 0) {
    return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })
  }

  // 2. Obtener histórico de precios
  const { data: historico } = await supabase
    .from('valorhistoricoactivo')
    .select('valor, fecha')
    .eq('activocodigo', activoCodigo)
    .order('fecha', { ascending: true })

  const precioActual = historico && historico.length > 0 
    ? Number(historico[historico.length - 1].valor) 
    : 0

  // 3. Consolidar (por si el usuario tiene varias entradas del mismo activo)
  const totalCantidad = posiciones.reduce((acc, curr) => acc + curr.cantidad, 0)
  const costeTotal = posiciones.reduce((acc, curr) => acc + (curr.cantidad * curr.precio_compra), 0)
  const precioMedioCompra = totalCantidad > 0 ? costeTotal / totalCantidad : 0
  
  const valorTotal = totalCantidad * precioActual
  const rentabilidad = precioMedioCompra > 0
    ? ((precioActual - precioMedioCompra) / precioMedioCompra) * 100
    : 0

  return NextResponse.json({
    activocodigo: activoCodigo,
    cantidad: totalCantidad,
    precio_compra: precioMedioCompra,
    precio_actual: precioActual,
    valor_total: Math.round(valorTotal * 100) / 100,
    rentabilidad_pct: Math.round(rentabilidad * 100) / 100,
    activos: posiciones[0].activos,
    historico: historico || []
  })
}

// DELETE /api/activos/[id] -> Eliminar activo
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  
  const { error } = await supabase
    .from('activosposeidos')
    .delete()
    .eq('usuario_id', user.id)
    .eq('activocodigo', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}