import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/types'

// GET /api/perfil
// Devuelve el perfil del usuario autenticado (perfiles + email de auth.users)
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ...data, email: user.email } satisfies Perfil & { email: string })
}

// PUT /api/perfil
// Actualiza los campos editables del perfil del usuario
export async function PUT(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body: Partial<Pick<Perfil,
    'nombrecompleto' | 'telefono' | 'perfilriesgocodigo' |
    'divisabasecodigo' | 'idiomacodigo' | 'formatofecha'
  >> = await request.json()

  const camposPermitidos = [
    'nombrecompleto', 'telefono', 'perfilriesgocodigo',
    'divisabasecodigo', 'idiomacodigo', 'formatofecha',
  ] as const

  const actualizacion = Object.fromEntries(
    camposPermitidos
      .filter(campo => campo in body)
      .map(campo => [campo, body[campo]])
  )

  const { data, error } = await supabase
    .from('perfiles')
    .update({ ...actualizacion, ultimoacceso: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ...data, email: user.email })
}
