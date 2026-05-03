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

  const { id } = await params;
  const activocodigo = parseInt(id)
  if (isNaN(activocodigo)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  // 1. Obtener posiciones del usuario para este activo
    const { data: posiciones, error: errorPos } = await supabase
      .from('activosposeidos')
      .select(`
        id,
        usuario_id,
        activocodigo,
        cantidad,
        fechainicio,
        precio_compra,
        activos (
          codigo,
          descripcion,
          tipocodigo,
          color,
          simbolo,
          tiposactivos ( codigo, descripcion, riesgocodigo ),
          divisas (codigo, simbolo_divisa)
        )
      `)
      .eq('usuario_id', user.id)
      .eq('activocodigo', id)
   //   .single()

  if (errorPos || !posiciones || posiciones.length === 0) {
    console.error("Error o activo no encontrado:", errorPos)
    return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })
  }

  const simboloDivisa = posiciones.activos?.divisas?.simbolo_divisa

  // 2. Obtener histórico de precios usando el mismo ID
  const { data: historico } = await supabase
    .from('valorhistoricoactivo')
    .select('valor, fecha')
    .eq('activocodigo', id) // Cambiado activoBusqueda por id
    .order('fecha', { ascending: false })


    const precioActual = historico && historico.length > 0 ? Number(historico[0].valor) : 0
    console.log('El precio actual es: ' + precioActual)
    const valorTotal = posiciones.cantidad * precioActual
    const rentabilidad = posiciones.precio_compra > 0
      ? ((precioActual - posiciones.precio_compra) / posiciones.precio_compra) * 100
      : 0

  // 3. Cálculos de consolidación
  const totalCantidad = posiciones.reduce((acc, curr) => acc + curr.cantidad, 0)
  const costeTotal = posiciones.reduce((acc, curr) => acc + (curr.cantidad * curr.precio_compra), 0)
  const precioMedioCompra = totalCantidad > 0 ? costeTotal / totalCantidad : 0


  // 4. Respuesta unificada
  return NextResponse.json({
    activocodigo: id, // Cambiado activoBusqueda por id
    cantidad: totalCantidad,
    precio_compra: precioMedioCompra,
    precio_actual: precioActual,
    simbolo_divisa: simboloDivisa,
    activos: posiciones[0].activos,
    historico: historico || [],
    compras: posiciones.map(p => ({
      id: p.id,
      cantidad: p.cantidad,
      precio_compra: p.precio_compra,
      fechainicio: p.fechainicio
    }))
  })
}

// DELETE /api/activos/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const resolvedParams = await params
  const idStr = resolvedParams.id
  const activoBusqueda = isNaN(Number(idStr)) ? idStr : parseInt(idStr)

  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get('transactionId')

  let query = supabase.from('activosposeidos').delete().eq('usuario_id', user.id)

  if (transactionId && transactionId !== "undefined") {
    // Borrado de una sola fila (transacción específica)
    query = query.eq('id', transactionId)
  } else {
    // Borrado de todas las filas que coincidan con el código de activo
    query = query.eq('activocodigo', activoBusqueda)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}