// lib/services/coinbase.ts
import { insertarVinculo } from "./vinculos";

export async function procesarVinculoCoinbase(usuarioId: string, apiKey: string, apiSecret: string) {
  // 1. Llamamos a nuestra API de validación (debes añadir la lógica de Coinbase en el backend)
  const res = await fetch('/api/cuentas/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      apiKey, 
      apiSecret, 
      exchange: 'coinbase' // Importante para que el backend sepa qué lógica usar
    })
  });
  
  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || "Fallo en la autenticación con Coinbase");
  }

  // 2. Recorremos las cuentas de Coinbase que tengan saldo
  if (data.accounts && data.accounts.length > 0) {
    for (const account of data.accounts) {
      // Coinbase suele devolver cuentas por divisa (BTC Wallet, ETH Wallet...)
      await insertarVinculo(
        usuarioId,
        account.currency,       // Ej: 'BTC'
        new Date().toISOString(),
        parseFloat(account.balance), // Saldo de esa wallet
        'coinbase'
      );
    }
  }
  
  return { success: true, count: data.accounts?.length || 0 };
}