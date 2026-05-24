import Alpaca from '@alpacahq/alpaca-trade-api'

type Balance = {
  asset: string
  free: string
  locked: string
}

export async function obtenerCarteraAlpaca(
  apiKey: string,
  secretKey: string
): Promise<Balance[]> {

  try {

    const alpaca = new Alpaca({
      keyId: apiKey,
      secretKey: secretKey,

      paper: true
    })

    // Obtener posiciones
    const positions = await alpaca.getPositions()

    // Normalizar formato
    const balances: Balance[] = positions.map(
      (position: any) => ({
        asset: position.symbol,
        free: position.qty,
        locked: '0'
      })
    )

    return balances

  } catch (error: any) {

    console.error('Error Alpaca:')

    if (error.response?.data) {
      console.error(error.response.data)
    } else {
      console.error(error.message)
    }

    throw new Error(
      'No se pudo obtener la cartera de Alpaca'
    )
  }
}

export async function obtenerCarteraAlpacaMock(
  apiKey: string,
  secretKey: string
): Promise<Balance[]> {

  // Simular delay
  await new Promise(resolve =>
    setTimeout(resolve, 1500)
  )

  return [
    {
      asset: 'AAPL',
      free: '15',
      locked: '0'
    },
    {
      asset: 'MSFT',
      free: '7',
      locked: '0'
    },
    {
      asset: 'SPY',
      free: '4',
      locked: '0'
    },
    {
      asset: 'TSLA',
      free: '2',
      locked: '0'
    }
  ]
}