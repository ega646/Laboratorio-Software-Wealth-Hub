import { createServiceClient } from '@/lib/supabase/service'
import {
  COINGECKO_IDS,
  normalizarCoinGecko,
  normalizarAlphaVantage,
  type PrecioNormalizado,
} from '@/lib/utils/precios'

export interface ResultadoActualizacion {
  actualizados: number
  errores: string[]
}

// Lógica compartida entre el endpoint manual (POST /api/precios)
// y el cron automático (GET /api/precios/cron)
export async function actualizarPrecios(): Promise<ResultadoActualizacion> {
  const supabase = createServiceClient()
  const errores: string[] = []

  const { data: activos, error } = await supabase
    .from('activos')
    .select('codigo, tipocodigo, divisacodigo, simbolo')
    .not('simbolo', 'is', null)

  if (error || !activos || activos.length === 0) {
    return { actualizados: 0, errores }
  }

  const cryptoActivos = activos.filter(a => a.tipocodigo === 'CRYPTO')
  const inversionActivos = activos.filter(a => a.tipocodigo === 'INVERSION')
  const precios: PrecioNormalizado[] = []

  // ── CoinGecko (CRYPTO) ──────────────────────────────────────
  if (cryptoActivos.length > 0) {
    const coinIds = cryptoActivos
      .map(a => COINGECKO_IDS[a.simbolo!.toUpperCase()])
      .filter(Boolean)
      .join(',')
    const divisas = [...new Set(cryptoActivos.map(a => a.divisacodigo.toLowerCase()))].join(',')

    const headers: Record<string, string> = { Accept: 'application/json' }
    if (process.env.COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY
    }

    try {
      const resp = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=${divisas}`,
        { headers }
      )
      if (resp.ok) {
        precios.push(...normalizarCoinGecko(await resp.json(), cryptoActivos as any))
      } else {
        errores.push(`CoinGecko ${resp.status}: ${resp.statusText}`)
      }
    } catch (e) {
      errores.push(`CoinGecko: ${(e as Error).message}`)
    }
  }

  // ── Alpha Vantage (INVERSION) ───────────────────────────────
  const alphaKey = process.env.ALPHAVANTAGE_API_KEY
  if (alphaKey && inversionActivos.length > 0) {
    for (const activo of inversionActivos) {
      if (!activo.simbolo) continue
      try {
        const resp = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${activo.simbolo}&apikey=${alphaKey}`
        )
        if (resp.ok) {
          const precio = normalizarAlphaVantage(await resp.json(), activo.codigo)
          if (precio) precios.push(precio)
        } else {
          errores.push(`AlphaVantage ${activo.simbolo} ${resp.status}`)
        }
      } catch (e) {
        errores.push(`AlphaVantage ${activo.simbolo}: ${(e as Error).message}`)
      }
      // Tier gratuito: 5 req/min → pequeña pausa entre llamadas
      await new Promise(r => setTimeout(r, 200))
    }
  }

  // ── Upsert en valorhistoricoactivo ──────────────────────────
  if (precios.length > 0) {
    const { error: upsertErr } = await supabase
      .from('valorhistoricoactivo')
      .upsert(precios, { onConflict: 'activocodigo,fecha' })
    if (upsertErr) errores.push(`DB upsert: ${upsertErr.message}`)
  }

  return { actualizados: precios.length, errores }
}
