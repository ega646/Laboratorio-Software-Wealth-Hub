import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/activos -> Listar todos los activos del usuario
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Traemos todos los activos del usuario
  const { data, error } = await supabase
    .from('activosposeidos')
    .select(`
      activocodigo,
      cantidad,
      precio_compra,
      activos (
        codigo, descripcion, color, simbolo,
        tiposactivos ( descripcion )
      )
    `)
    .eq('usuario_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST /api/activos -> Crear una nueva posición
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()

  const { data, error } = await supabase
    .from('activosposeidos')
    .insert({
      usuario_id: user.id,
      activocodigo: parseInt(body.activocodigo),
      cantidad: parseFloat(body.cantidad),
      fechainicio: body.fechainicio || new Date().toISOString().split('T')[0],
      precio_compra: parseFloat(body.precio_compra) || 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}