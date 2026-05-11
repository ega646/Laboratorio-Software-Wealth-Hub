import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/recomendaciones
// Devuelve las recomendaciones del usuario que están en estado 'activa'
// o 'recordar' con fecha_recordatorio en el pasado (vuelven a estar activas).
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const ahora = new Date().toISOString()

  // BUG FIX: la reactivación de recordatorios vencidos se hace en paralelo con la lectura
  // pero no bloqueamos si falla (no afecta la respuesta principal)
  void supabase
    .from('recomendaciones')
    .update({ estado: 'activa', fecha_recordatorio: null })
    .eq('usuario_id', user.id)
    .eq('estado', 'recordar')
    .lte('fecha_recordatorio', ahora)

  // Leer activas + las que tenían recordatorio ya vencido (estado='recordar' y fecha <= ahora)
  const { data, error } = await supabase
    .from('recomendaciones')
    .select('*')
    .eq('usuario_id', user.id)
    .or(`estado.eq.activa,and(estado.eq.recordar,fecha_recordatorio.lte.${ahora})`)
    .order('fecha_creacion', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}
