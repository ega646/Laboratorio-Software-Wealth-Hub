export interface PrecioNormalizado {
  activocodigo: number
  fecha: string
  valor: number
}

// Convierte el símbolo interno a ticker de Yahoo Finance
// Crypto: BTC → BTC-USD, ETH → ETH-USD, etc.
// Acciones/ETFs/Materias primas: ya tienen el ticker correcto (AAPL, SPY, GLD...)
export function toYahooTicker(simbolo: string, tipocodigo: string): string {
  if (tipocodigo === 'CRYPTO') return `${simbolo}-USD`
  // Yahoo usa guión en lugar de punto: BRK.B → BRK-B
  return simbolo.replace('.', '-')
}

// Normaliza la respuesta de /v7/finance/quote de Yahoo Finance
// Formato entrada: { quoteResponse: { result: [{ symbol, regularMarketPrice, ... }] } }
export function normalizarYahooFinance(
  response: any,
  activos: { codigo: number; simbolo: string; tipocodigo: string }[]
): PrecioNormalizado[] {
  const fecha = new Date().toISOString().split('T')[0]
  const quotes: any[] = response?.quoteResponse?.result ?? []

  return activos.flatMap(activo => {
    const yahooTicker = toYahooTicker(activo.simbolo, activo.tipocodigo)
    const quote = quotes.find(q => q.symbol === yahooTicker)
    const valor = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose
    if (!valor || valor <= 0) return []
    return [{ activocodigo: activo.codigo, fecha, valor }]
  })
}
