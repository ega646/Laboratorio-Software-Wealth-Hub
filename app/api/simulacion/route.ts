import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  simularCartera,
  type ActivoSimulable,
  type ResultadoSimulacion,
} from '@/lib/utils/montecarlo'

// GET /api/simulacion?dias=252&n=1000
//
// Ejecuta una simulación Monte Carlo (GBM) sobre la cartera del usuario:
//   1. Lee posiciones (cantidad y precio actual)
//   2. Lee histórico de precios de cada activo (orden ASC)
//   3. Estima parámetros (μ, σ) por activo
//   4. Genera N trayectorias y calcula percentiles P10/P50/P90
//
// Devuelve series temporales por percentil para dibujar el cono y un
// resumen al horizonte final.
//
// Query params:
//   dias  — horizonte en días (default 252 ≈ 1 año, máx 1260 ≈ 5 años)
//   n     — número de simulaciones (default 1000, máx 5000 para no
//           consumir demasiado CPU en serverless)
export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dias = Math.min(Math.max(parseInt(searchParams.get('dias') ?? '252'), 1), 1260)
  const n    = Math.min(Math.max(parseInt(searchParams.get('n')    ?? '1000'), 100), 5000)

  // 1. Posiciones del usuario
  const { data: posiciones, error } = await supabase
    .from('activosposeidos')
    .select('activocodigo, cantidad')
    .eq('usuario_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!posiciones || posiciones.length === 0) {
    return NextResponse.json({
      vacia: true,
      mensaje: 'No tienes activos en cartera para simular.',
    })
  }

  // 2. Histórico completo de cada activo (ASC para los cálculos)
  const codigos = posiciones.map(p => p.activocodigo)
  const { data: historicos } = await supabase
    .from('valorhistoricoactivo')
    .select('activocodigo, fecha, valor')
    .in('activocodigo', codigos)
    .order('fecha', { ascending: true })

  const seriePorActivo: Record<number, number[]> = {}
  for (const h of historicos ?? []) {
    if (!seriePorActivo[h.activocodigo]) seriePorActivo[h.activocodigo] = []
    seriePorActivo[h.activocodigo].push(Number(h.valor))
  }

  // 3. Construir lista para simulación
  const activosSimulables: ActivoSimulable[] = posiciones.map(p => {
    const serie = seriePorActivo[p.activocodigo] ?? []
    const precioActual = serie.length > 0 ? serie[serie.length - 1] : 0
    return {
      codigo: p.activocodigo,
      cantidad: p.cantidad,
      precioActual,
      serieAsc: serie,
    }
  })

  // Si la cartera completa carece de histórico, no podemos simular
  const algunActivoConHistorico = activosSimulables.some(a => a.serieAsc.length >= 30)
  if (!algunActivoConHistorico) {
    return NextResponse.json({
      sinHistorico: true,
      mensaje: 'No hay suficiente histórico (>=30 días) para simular ningún activo de tu cartera.',
      activos: activosSimulables.map(a => ({ codigo: a.codigo, dias: a.serieAsc.length })),
    })
  }

  // 4. Ejecutar Monte Carlo
  const resultado: ResultadoSimulacion = simularCartera(activosSimulables, dias, n)

  return NextResponse.json(resultado)
}
