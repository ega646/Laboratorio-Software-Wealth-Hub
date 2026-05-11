import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/recomendaciones/[id]
// Cambia el estado de una recomendación: 'ignorada' o 'recordar' (con
// fecha_recordatorio en el futuro). Solo el dueño puede modificarla
// gracias a la RLS de la tabla recomendaciones.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const recomendacionId = parseInt(id)
  if (isNaN(recomendacionId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({})) as {
    estado?: 'ignorada' | 'recordar'
    dias?: number
  }

  if (body.estado !== 'ignorada' && body.estado !== 'recordar') {
    return NextResponse.json(
      { error: 'estado debe ser "ignorada" o "recordar"' },
      { status: 400 },
    )
  }

  let fechaRecordatorio: string | null = null
  if (body.estado === 'recordar') {
    const dias = typeof body.dias === 'number' && body.dias > 0 ? body.dias : 7
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + dias)
    fechaRecordatorio = fecha.toISOString()
  }

  const { error } = await supabase
    .from('recomendaciones')
    .update({
      estado: body.estado,
      fecha_recordatorio: fechaRecordatorio,
    })
    .eq('id', recomendacionId)
    .eq('usuario_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
