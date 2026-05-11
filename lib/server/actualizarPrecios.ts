import { createServiceClient } from '@/lib/supabase/service'
import { toYahooTicker, normalizarYahooFinance, type PrecioNormalizado } from '@/lib/utils/precios'

export interface ResultadoActualizacion {
  actualizados: number
  errores: string[]
}

// Pares de forex que mantenemos en la tabla cambios.
// Yahoo Finance usa el formato EURUSD=X (cuántos USD por 1 EUR).
const FOREX_PARES = [
  { origen: 'EUR', destino: 'USD', ticker: 'EURUSD=X' },
  { origen: 'USD', destino: 'EUR', ticker: 'USDEUR=X' },
  { origen: 'EUR', destino: 'GBP', ticker: 'EURGBP=X' },
  { origen: 'GBP', destino: 'EUR', ticker: 'GBPEUR=X' },
  { origen: 'USD', destino: 'GBP', ticker: 'USDGBP=X' },
  { origen: 'GBP', destino: 'USD', ticker: 'GBPUSD=X' },
]

async function actualizarTiposDeCambio(
  supabase: ReturnType<typeof createServiceClient>,
  errores: string[]
): Promise<void> {
  const forexTickers = FOREX_PARES.map(p => p.ticker).join(',')
  const hoy = new Date().toISOString().split('T')[0]

  try {
    const resp = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${forexTickers}&fields=regularMarketPrice`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WealthHub/1.0)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10_000),
      }
    )

    if (!resp.ok) {
      errores.push(`Yahoo Finance forex HTTP ${resp.status}`)
      return
    }

    const json = await resp.json()
    const quotes: any[] = json?.quoteResponse?.result ?? []

    const filas = FOREX_PARES.flatMap(par => {
      const quote = quotes.find(q => q.symbol === par.ticker)
      const valor = quote?.regularMarketPrice
      if (!valor || valor <= 0) return []
      return [{
        divisaorigen: par.origen,
        divisadestino: par.destino,
        fecini: hoy,
        fecfin: hoy,
        cambio: Math.round(valor * 1_000_000) / 1_000_000,
      }]
    })

    if (filas.length > 0) {
      const { error } = await supabase
        .from('cambios')
        .upsert(filas, { onConflict: 'divisaorigen,divisadestino,fecini' })
      if (error) errores.push(`Cambios upsert: ${error.message}`)
    }
  } catch (e: any) {
    errores.push(`Yahoo Finance forex: ${e.message}`)
  }
}

// Lógica compartida entre el endpoint manual (POST /api/precios)
// y el cron automático (GET /api/precios/cron, lunes-viernes 21:00 UTC).
// Actualiza precios de activos Y tipos de cambio en una sola ejecución.
export async function actualizarPrecios(): Promise<ResultadoActualizacion> {
  const supabase = createServiceClient()
  const errores: string[] = []

  // Solo activos con símbolo (EFECTIVO y PROPIEDAD no tienen precio de mercado)
  const { data: activos, error } = await supabase
    .from('activos')
    .select('codigo, tipocodigo, divisacodigo, simbolo')
    .not('simbolo', 'is', null)

  if (error || !activos || activos.length === 0) {
    return { actualizados: 0, errores }
  }

  const tickers = activos
    .filter(a => a.simbolo)
    .map(a => toYahooTicker(a.simbolo!, a.tipocodigo))
    .join(',')

  let precios: PrecioNormalizado[] = []

  // Precios de activos y tipos de cambio en paralelo
  const [preciosResult] = await Promise.all([
    fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickers}&fields=regularMarketPrice,regularMarketPreviousClose,currency`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WealthHub/1.0)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10_000),
      }
    ),
    actualizarTiposDeCambio(supabase, errores),
  ])

  if (!preciosResult.ok) {
    errores.push(`Yahoo Finance precios HTTP ${preciosResult.status}`)
  } else {
    const json = await preciosResult.json()
    precios = normalizarYahooFinance(json, activos as any)

    for (const a of activos.filter(a => !precios.find(p => p.activocodigo === a.codigo))) {
      errores.push(`Sin precio: ${a.simbolo}`)
    }
  }

  if (precios.length > 0) {
    const { error: upsertErr } = await supabase
      .from('valorhistoricoactivo')
      .upsert(precios, { onConflict: 'activocodigo,fecha' })
    if (upsertErr) errores.push(`DB upsert precios: ${upsertErr.message}`)
  }

  return { actualizados: precios.length, errores }
}
