import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/activos/[id]   (id = activocodigo)
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
        tiposactivos ( codigo, descripcion, riesgocodigo )
      )
    `)
    .eq('usuario_id', user.id)
    .eq('activocodigo', activocodigo)
    .single()

  if (error || !posicion) return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })

  const { data: historico } = await supabase
    .from('valorhistoricoactivo')
    .select('valor, fecha')
    .eq('activocodigo', activocodigo)
    .order('fecha', { ascending: false })
    .limit(7)

  const precioActual = historico && historico.length > 0 ? Number(historico[0].valor) : 0
  const valorTotal = (posicion.cantidad || 0) * precioActual
  const rentabilidad = (posicion.precio_compra || 0) > 0
    ? ((precioActual - posicion.precio_compra) / posicion.precio_compra) * 100
    : 0

  return NextResponse.json({
    usuario_id: posicion.usuario_id,
    activocodigo: posicion.activocodigo,
    cantidad: posicion.cantidad,
    precio_compra: posicion.precio_compra,
    activos: posicion.activos,
    precio_actual: precioActual,
    valor_total: Math.round(valorTotal * 100) / 100,
    rentabilidad_pct: Math.round(rentabilidad * 100) / 100,
    historico: historico ?? [],
  })
}

// DELETE /api/activos/[id]   (id = activocodigo)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  
  // 1. [UC08] Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Extraer y validar el ID
  const { id } = await params
  const activocodigo = parseInt(id)
  if (isNaN(activocodigo)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    // 3. [UC08] Llamar a DELETE en la base de datos
    // Filtramos por usuario_id para asegurar que nadie borre activos ajenos
    const { error, count } = await supabase
      .from('activosposeidos')
      .delete({ count: 'exact' })
      .eq('usuario_id', user.id)
      .eq('activocodigo', activocodigo)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Si el conteo es 0, significa que el activo no existía o no pertenecía al usuario
    if (count === 0) {
      return NextResponse.json({ error: 'Activo no encontrado o no autorizado' }, { status: 404 })
    }

    // 4. [UC08] Respuesta exitosa para confirmar en el frontend
    return NextResponse.json({ 
      success: true, 
      message: "Activo eliminado correctamente de tu cartera" 
    })
    
  } catch (err) {
    console.error("Error en DELETE /api/activos/[id]:", err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}