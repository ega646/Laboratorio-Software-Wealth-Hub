// lib/services/binance.ts
import { insertarVinculo } from "./vinculos";

export async function procesarVinculoBinance(
    apiKey: string,
    apiSecret: string) {

   /*
  // 1. Validamos y obtenemos saldos desde nuestra API de validación
  const res = await fetch('/api/cuentas/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, apiSecret, exchange: 'binance' })
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || "Fallo en la autenticación con Binance");
  }

  // 2. Si Binance nos devuelve balances, los recorremos e insertamos
  // Nota: data.balances viene de la respuesta de Binance que configuramos en la API
  if (data.balances && data.balances.length > 0) {
    for (const item of data.balances) {
      await insertarVinculo(
        usuarioId,
        item.asset,           // codigo del activo (BTC, ETH, etc)
        new Date().toISOString(), // fecha de inicio
        parseFloat(item.free), // cantidad disponible
        'binance'
      );
    }
  }
  */
  await insertarVinculo(
          'BINANCE',
          new Date().toISOString(), // fecha de inicio
          apiKey,
          apiSecret
        );

  
  return { success: true, count: data.balances?.length || 0 };
}