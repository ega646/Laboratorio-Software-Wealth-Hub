import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  simularCartera,
  type ActivoSimulable,
  type ResultadoSimulacion,
} from '@/lib/utils/montecarlo'

// GET /api/simulacion?dias=252&n=1000
//
// Simula la evolución del patrimonio del usuario con Monte Carlo (GBM):
//   1. Lee las posiciones del usuario (activocodigo + cantidad)
//   2. Obtiene el precio actual de cada activo igual que /api/portfolio
//      (último valor en valorhistoricoactivo, ORDER fecha DESC)
//   3. Lee el histórico completo por activo (query individual para evitar
//      el límite de 1000 filas de Supabase en queries con .in())
//   4. Simula N trayectorias y devuelve P10/P50/P90
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
    return NextResponse.json({ vacia: true, mensaje: 'No tienes activos en cartera para simular.' })
  }

  const codigosUnicos = [...new Set(posiciones.map(p => Number(p.activocodigo)))]

  // 2. Precio actual de cada activo: mismo método que /api/portfolio
  //    (primer valor al ordenar por fecha DESC = el más reciente)
  const { data: preciosRecientes } = await supabase
    .from('valorhistoricoactivo')
    .select('activocodigo, valor')
    .in('activocodigo', codigosUnicos)
    .order('fecha', { ascending: false })
    .limit(codigosUnicos.length * 10)

  const precioActualPorActivo: Record<number, number> = {}
  for (const h of preciosRecientes ?? []) {
    const codigo = Number(h.activocodigo)
    if (!(codigo in precioActualPorActivo)) {
      precioActualPorActivo[codigo] = Number(h.valor)
    }
  }

  // 3. Histórico completo por activo en queries individuales paginadas.
  //    PostgREST tiene max_rows=1000 en el servidor; .range() permite iterar
  //    en páginas de 1000 para obtener todos los registros disponibles.
  const seriesPorActivo: Record<number, number[]> = {}
  await Promise.all(
    codigosUnicos.map(async (codigo) => {
      const serie: number[] = []
      const PAGE = 1000
      let desde = 0
      while (true) {
        const { data } = await supabase
          .from('valorhistoricoactivo')
          .select('valor')
          .eq('activocodigo', codigo)
          .order('fecha', { ascending: true })
          .range(desde, desde + PAGE - 1)
        if (!data || data.length === 0) break
        serie.push(...data.map((h: { valor: unknown }) => Number(h.valor)))
        if (data.length < PAGE) break
        desde += PAGE
      }
      seriesPorActivo[codigo] = serie
    })
  )

  // 4. Construir activos para la simulación
  //    precioActual viene de la query DESC (mismo que el dashboard)
  //    serieAsc viene del histórico completo para estimar μ y σ
  const cantidadPorActivo: Record<number, number> = {}
  for (const p of posiciones) {
    const codigo = Number(p.activocodigo)
    cantidadPorActivo[codigo] = (cantidadPorActivo[codigo] ?? 0) + p.cantidad
  }

  const activosSimulables: ActivoSimulable[] = codigosUnicos.map(codigo => ({
    codigo,
    cantidad:     cantidadPorActivo[codigo] ?? 0,
    precioActual: precioActualPorActivo[codigo] ?? 0,
    serieAsc:     seriesPorActivo[codigo] ?? [],
  }))

  const algunConHistorico = activosSimulables.some(a => a.serieAsc.length >= 30)
  if (!algunConHistorico) {
    return NextResponse.json({
      sinHistorico: true,
      mensaje: 'No hay suficiente histórico (≥30 días) para simular ningún activo de tu cartera.',
      activos: activosSimulables.map(a => ({ codigo: a.codigo, dias: a.serieAsc.length })),
    })
  }

  // 5. Monte Carlo
  const resultado: ResultadoSimulacion = simularCartera(activosSimulables, dias, n)
  return NextResponse.json(resultado)
}
