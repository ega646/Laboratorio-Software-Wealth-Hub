import { insertarVinculo } from './vinculos'

import { procesarVinculoBinance } from '@/app/api/services/binance'
import { procesarVinculoCoinbase } from '@/app/api/services/coinbase'
import { procesarVinculoManual } from '@/app/api/services/manual'

export async function procesarVinculo(
  tipoCuenta: string | null,
  apiKey: string,
  apiSecret: string
) {
  if (!tipoCuenta) {
    throw new Error('Tipo de cuenta inválido')
  }

  let validacion = false

  switch (tipoCuenta) {
    case 'BINANCE':
      validacion = await procesarVinculoBinance(apiKey, apiSecret)
      break

    case 'COINBASE':
      validacion = await procesarVinculoCoinbase(apiKey, apiSecret)
      break

    case 'MANUAL':
      validacion = await procesarVinculoManual(apiKey, apiSecret)
      break

    default:
      throw new Error('Tipo de cuenta no soportado')
  }

  if (!validacion) {
    throw new Error('Credenciales inválidas')
  }

  const resultado = await insertarVinculo({
    tipoCuenta,
    fechaInicio: new Date().toISOString(),
    apikey_cifrada: apiKey,
    secretkey_cifrada: apiSecret
  })

  return {
    success: true,
    data: resultado
  }
}