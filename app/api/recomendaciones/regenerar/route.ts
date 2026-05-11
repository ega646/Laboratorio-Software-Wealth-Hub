import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { regenerarRecomendacionesUsuario } from '@/lib/server/regenerarRecomendaciones'

// POST /api/recomendaciones/regenerar
// Recalcula las recomendaciones del usuario actual (típicamente
// invocado tras cambios manuales en la cartera o desde un botón de UI).
export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const resultado = await regenerarRecomendacionesUsuario(user.id)
  return NextResponse.json(resultado)
}
