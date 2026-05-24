type Balance = {
  asset: string
  free: string
  locked: string
}

export async function obtenerCarteraIBKRMock(
  apiKey: string,
  secretKey: string
): Promise<Balance[]> {

  // Simular latencia real de broker (más lenta que crypto)
  await new Promise(resolve => setTimeout(resolve, 2000))

  // IBKR mezcla acciones, ETFs y cash
  return [
    {
      asset: 'AAPL',
      free: '12',
      locked: '0'
    },
    {
      asset: 'MSFT',
      free: '8',
      locked: '0'
    },
    {
      asset: 'TSLA',
      free: '3',
      locked: '0'
    },
    {
      asset: 'SPY',
      free: '5',
      locked: '0'
    },
    {
      asset: 'QQQ',
      free: '2',
      locked: '0'
    },

    // cash (IBKR siempre lo separa)
    {
      asset: 'USD',
      free: '1500.75',
      locked: '0'
    }
  ]
}