import { NextResponse } from 'next/server'
import { cargarHistorico } from '@/lib/server/cargarHistorico'

// GET /api/precios/cargar-historico?dias=1825&activo=10
//
// Endpoint de administración: descarga el histórico de precios de los
// últimos N días desde APIs externas y lo guarda en valorhistoricoactivo.
// Pesado y rate-limited → se invoca manualmente, no en producción
// regular. Protegido con CRON_SECRET (igual patrón que /api/precios/cron).
//
// Query params:
//   dias    — días de histórico a descargar (default: 1825 ≈ 5 años)
//   activo  — opcional, código de un único activo a procesar
//
// Responde con: { procesados, insertados, errores: [] }
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
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
