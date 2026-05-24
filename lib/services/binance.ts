import { Spot } from '@binance/connector'

export async function obtenerCarteraBinance(
  apiKey: string,
  secretKey: string
) {
  try {
    const client = new Spot(apiKey, secretKey)

    // Obtener cuenta
    const response = await client.account()

    const balances = response.data.balances

    // Filtrar balances con fondos
    const balancesActivos = balances.filter(
      (b: any) =>
        Number(b.free) > 0 ||
        Number(b.locked) > 0
    )

    return balancesActivos

  } catch (error: any) {
    console.error('Error Binance:')

    if (error.response?.data) {
      console.error(error.response.data)
    } else {
      console.error(error.message)
    }

    throw new Error('No se pudo obtener la cartera de Binance')
  }
}

export async function obtenerCarteraBinanceMock(
  apiKey: string,
  secretKey: string
) {

  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Respuesta fake tipo Binance
  const balances = [
    {
      asset: 'BTC',
      free: '0.015',
      locked: '0.000'
    },
    {
      asset: 'ETH',
      free: '0.42',
      locked: '0.10'
    },
    {
      asset: 'USDT',
      free: '1250.50',
      locked: '0.000'
    }
  ]


  return balances
}