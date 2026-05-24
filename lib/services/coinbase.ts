import { CBAppClient } from 'coinbase-api'

export async function obtenerCarteraCoinbase(
  apiKey: string,
  secretKey: string
) {
  try {

    const client = new CBAppClient({
      apiKey,
      apiSecret: secretKey
    })

    // Obtener cuentas
    const response = await client.getAccounts()

    // Normalizar balances
    const balances = response.accounts
      .filter(
        (a: any) =>
          Number(a.available_balance?.value || 0) > 0
      )
      .map((a: any) => ({
        asset: a.available_balance.currency,
        free: a.available_balance.value,
        locked: '0.000'
      }))

    return balances

  } catch (error: any) {

    console.error('Error Coinbase:')

    if (error.response?.data) {
      console.error(error.response.data)
    } else {
      console.error(error.message)
    }

    throw new Error(
      'No se pudo obtener la cartera de Coinbase'
    )
  }
}

export async function obtenerCarteraCoinbaseMock(
  apiKey: string,
  secretKey: string
) {

  await new Promise(resolve =>
    setTimeout(resolve, 1500)
  )

  return [
    {
      asset: 'BTC',
      free: '0.005',
      locked: '0.000'
    },
    {
      asset: 'SOL',
      free: '12.50',
      locked: '0.000'
    },
    {
      asset: 'EUR',
      free: '850.75',
      locked: '0.000'
    }
  ]
}