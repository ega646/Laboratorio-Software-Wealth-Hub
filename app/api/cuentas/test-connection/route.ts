// app/api/cuentas/test-connection/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { apiKey, apiSecret, exchange } = await req.json();

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "La API Key y el Secret son obligatorios" },
        { status: 400 }
      );
    }

    // --- CASO BINANCE ---
    if (exchange === "binance") {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(queryString)
        .digest("hex");

      const response = await axios.get("https://api.binance.com/api/v3/account", {
        params: { timestamp, signature },
        headers: { "X-MBX-APIKEY": apiKey },
      });

      const tickerRes = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");

      return NextResponse.json({ 
        success: true, 
        message: "Binance validado",
        price: tickerRes.data.price,
        balances: response.data.balances.filter((b: any) => parseFloat(b.free) > 0)
      });
    }

    // --- CASO COINBASE (Advanced Trade API) ---
    if (exchange === "coinbase") {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const method = "GET";
      const path = "/api/v3/brokerage/accounts"; // Endpoint para listar cuentas/balances
      
      /**
       * FIRMA COINBASE:
       * Se concatena timestamp + método + path + body
       */
      const message = timestamp + method + path;
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(message)
        .digest("hex");

      const response = await axios.get(`https://api.coinbase.com${path}`, {
        headers: {
          "CB-ACCESS-KEY": apiKey,
          "CB-ACCESS-SIGN": signature,
          "CB-ACCESS-TIMESTAMP": timestamp,
          "Content-Type": "application/json",
        },
      });

      // Mapeamos la respuesta de Coinbase para que sea compatible con nuestro frontend
      const accounts = response.data.accounts.map((acc: any) => ({
        asset: acc.currency,
        free: acc.available_balance.value
      })).filter((a: any) => parseFloat(a.free) > 0);

      return NextResponse.json({ 
        success: true, 
        message: "Coinbase validado",
        accounts: accounts 
      });
    }

    return NextResponse.json({ success: false, error: "Exchange no soportado" }, { status: 400 });

  } catch (error: any) {
    console.error("Error de validación:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.error_details || error.response?.data?.msg || "Credenciales inválidas";
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 401 });
  }
}