import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { actualizarPrecios } from '@/lib/server/actualizarPrecios'

// POST /api/precios
// Actualiza precios de todos los activos con símbolo externo configurado.
// Llamado manualmente desde el botón del dashboard.
export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const resultado = await actualizarPrecios()
  return NextResponse.json(resultado)
}
