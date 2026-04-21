// Mapeo de símbolo de mercado → ID de CoinGecko
// CoinGecko usa IDs en minúsculas distintos de los tickers estándar
export const COINGECKO_IDS: Record<string, string> = {
  BTC:   'bitcoin',
  ETH:   'ethereum',
  SOL:   'solana',
  BNB:   'binancecoin',
  XRP:   'ripple',
  ADA:   'cardano',
  DOGE:  'dogecoin',
  DOT:   'polkadot',
  AVAX:  'avalanche-2',
  MATIC: 'matic-network',
  LINK:  'chainlink',
  UNI:   'uniswap',
  LTC:   'litecoin',
  BCH:   'bitcoin-cash',
  ATOM:  'cosmos',
}

export interface PrecioNormalizado {
  activocodigo: number
  fecha: string
  valor: number
}

// Normaliza la respuesta de /simple/price de CoinGecko
// Formato entrada: { bitcoin: { usd: 45000 }, ethereum: { eur: 2200 } }
export function normalizarCoinGecko(
  response: Record<string, Record<string, number>>,
  activos: { codigo: number; simbolo: string; divisacodigo: string }[]
): PrecioNormalizado[] {
  const fecha = new Date().toISOString().split('T')[0]
  return activos.flatMap(activo => {
    const coinId = COINGECKO_IDS[activo.simbolo.toUpperCase()]
    if (!coinId) return []
    const divisa = activo.divisacodigo.toLowerCase()
    const valor = response[coinId]?.[divisa]
    if (valor === undefined) return []
    return [{ activocodigo: activo.codigo, fecha, valor }]
  })
}

// Normaliza la respuesta de GLOBAL_QUOTE de Alpha Vantage
// Formato entrada: { "Global Quote": { "05. price": "150.00", ... } }
export function normalizarAlphaVantage(
  response: { 'Global Quote'?: Record<string, string> },
  activocodigo: number
): PrecioNormalizado | null {
  const fecha = new Date().toISOString().split('T')[0]
  const valor = parseFloat(response['Global Quote']?.['05. price'] ?? '')
  if (isNaN(valor) || valor === 0) return null
  return { activocodigo, fecha, valor }
}
