// UC16 — Carga de histórico de precios para los activos del catálogo
// Usa Yahoo Finance v8 chart API: sin API key, sin rate limits, llamadas paralelas.
// Descarga precios de cierre ajustados para todos los activos con símbolo.

import { createServiceClient } from '@/lib/supabase/service'
import { toYahooTicker, type PrecioNormalizado } from '@/lib/utils/precios'

export interface ResultadoCargaHistorico {
  procesados: number
  insertados: number
  errores: string[]
}

interface ActivoCargable {
  codigo: number
  tipocodigo: string
  divisacodigo: string
  simbolo: string | null
}

async function descargarYahooHistorico(
  activo: ActivoCargable,
  desde: number,
  hasta: number,
): Promise<PrecioNormalizado[]> {
  const ticker = toYahooTicker(activo.simbolo!, activo.tipocodigo)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&period1=${desde}&period2=${hasta}`

  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WealthHub/1.0)',
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!resp.ok) throw new Error(`HTTP ${resp.status} para ${ticker}`)

  const json = await resp.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error(`Sin datos para ${ticker}`)

  const timestamps: number[] = result.timestamp ?? []
  // Preferir adjclose (ajustado por splits/dividendos), fallback a close
  const closes: (number | null)[] =
    result.indicators?.adjclose?.[0]?.adjclose ??
    result.indicators?.quote?.[0]?.close ??
    []

  const filas: PrecioNormalizado[] = []
  for (let i = 0; i < timestamps.length; i++) {
    const valor = closes[i]
    if (!valor || valor <= 0) continue
    const fecha = new Date(timestamps[i] * 1000).toISOString().split('T')[0]
    filas.push({ activocodigo: activo.codigo, fecha, valor })
  }

  return filas
}

export async function cargarHistorico({
  dias,
  soloActivoCodigo,
}: {
  dias?: number
  soloActivoCodigo?: number
} = {}): Promise<ResultadoCargaHistorico> {
  const supabase = createServiceClient()
  const errores: string[] = []
  let insertados = 0

  let query = supabase
    .from('activos')
    .select('codigo, tipocodigo, divisacodigo, simbolo')
    .not('simbolo', 'is', null)

  if (soloActivoCodigo) query = query.eq('codigo', soloActivoCodigo)

  const { data: activos, error } = await query
  if (error || !activos || activos.length === 0) {
    return { procesados: 0, insertados: 0, errores: error ? [error.message] : [] }
  }

  const hasta = Math.floor(Date.now() / 1000)
  // Sin días especificados → todo el histórico disponible (Yahoo devuelve lo que tiene)
  const desde = dias != null
    ? hasta - dias * 24 * 60 * 60
    : 0

  // Descargar todos en paralelo — Yahoo Finance no tiene rate limit práctico
  const resultados = await Promise.allSettled(
    (activos as ActivoCargable[]).map(activo =>
      activo.simbolo
        ? descargarYahooHistorico(activo, desde, hasta)
        : Promise.resolve([] as PrecioNormalizado[])
    )
  )

  const todasFilas: PrecioNormalizado[] = []
  for (let i = 0; i < resultados.length; i++) {
    const r = resultados[i]
    const activo = activos[i] as ActivoCargable
    if (r.status === 'rejected') {
      errores.push(`${activo.simbolo}: ${r.reason?.message ?? 'error desconocido'}`)
    } else {
      todasFilas.push(...r.value)
    }
  }

  // Upsert en lotes de 500
  const BATCH = 500
  for (let i = 0; i < todasFilas.length; i += BATCH) {
    const batch = todasFilas.slice(i, i + BATCH)
    const { error: upsertErr } = await supabase
      .from('valorhistoricoactivo')
      .upsert(batch, { onConflict: 'activocodigo,fecha' })
    if (upsertErr) errores.push(`DB upsert: ${upsertErr.message}`)
    else insertados += batch.length
  }

  return { procesados: activos.length, insertados, errores }
}
