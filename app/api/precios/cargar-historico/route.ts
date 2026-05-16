import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cargarHistorico } from '@/lib/server/cargarHistorico'

// GET /api/precios/cargar-historico?dias=1825&activo=10
//
// Endpoint de administración: descarga el histórico de precios de los
// últimos N días desde APIs externas y lo guarda en valorhistoricoactivo.
// Autorización (en orden):
//   1. Bearer CRON_SECRET (cron job automatizado)
//   2. Sesión de Supabase activa (usuario logueado desde la UI)
//
// Query params:
//   dias    — días de histórico a descargar (omitir = todo el disponible)
//   activo  — opcional, código de un único activo a procesar
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const auth   = request.headers.get('authorization')

  const tokenValido = secret && auth === `Bearer ${secret}`

  if (!tokenValido) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const diasParam = searchParams.get('dias')
  const activoParam = searchParams.get('activo')

  const dias = diasParam ? parseInt(diasParam) : undefined
  const soloActivoCodigo = activoParam ? parseInt(activoParam) : undefined

  const resultado = await cargarHistorico({
    ...(dias ? { dias } : {}),
    ...(soloActivoCodigo ? { soloActivoCodigo } : {}),
  })

  return NextResponse.json(resultado)
}
