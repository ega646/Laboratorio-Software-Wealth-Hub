import { NextResponse } from 'next/server'
import { actualizarPrecios } from '@/lib/server/actualizarPrecios'

// GET /api/precios/cron
// Llamado automáticamente por Vercel Cron (vercel.json).
// Protegido con CRON_SECRET para que solo Vercel pueda invocarlo.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const resultado = await actualizarPrecios()
  return NextResponse.json(resultado)
}
