"""
Descarga 1 año de precios diarios reales desde Yahoo Finance y los sube
a Supabase: precios de activos + tipos de cambio EUR/USD/GBP.

Requisitos (dentro del entorno virtual):
    python -m venv .venv
    source .venv/bin/activate
    pip install yfinance supabase python-dotenv pandas

Uso:
    source .venv/bin/activate
    python scripts/cargar_historico.py

Variables de entorno necesarias (en .env.local):
    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
"""

import os
import datetime
import pandas as pd
import yfinance as yf
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv(".env")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

END   = datetime.date.today()
START = END - datetime.timedelta(days=365)

# ─────────────────────────────────────────────────────────────────────────────
# Mapeo: activocodigo → ticker de Yahoo Finance
# ─────────────────────────────────────────────────────────────────────────────
ACTIVOS = {
    # Crypto (precio en USD)
    10: "BTC-USD",
    11: "ETH-USD",
    12: "BNB-USD",
    13: "SOL-USD",
    14: "XRP-USD",
    15: "DOGE-USD",
    16: "ADA-USD",
    17: "TRX-USD",
    18: "AVAX-USD",
    19: "LINK-USD",
    # Acciones US (precio en USD)
    20: "AAPL",
    21: "MSFT",
    22: "GOOGL",
    23: "AMZN",
    24: "NVDA",
    25: "META",
    26: "TSLA",
    27: "JPM",
    28: "V",
    29: "JNJ",
    # ETFs
    30: "SPY",
    31: "QQQ",
    # Materias primas
    40: "GLD",
    41: "SLV",
    # EFECTIVO (50, 51) → precio = 1 siempre, no necesitan histórico
}

# Pares de divisa → ticker Yahoo Finance (EUR es la divisa base en el proyecto)
# Yahoo: EURUSD=X = cuántos USD por 1 EUR
FOREX_TICKERS = {
    ("EUR", "USD"): "EURUSD=X",
    ("USD", "EUR"): "USDEUR=X",
    ("EUR", "GBP"): "EURGBP=X",
    ("GBP", "EUR"): "GBPEUR=X",
    ("USD", "GBP"): "USDGBP=X",
    ("GBP", "USD"): "GBPUSD=X",
}


def extraer_close(df: pd.DataFrame) -> pd.Series:
    """Extrae Close como Serie 1D (compatible con todas las versiones de yfinance)."""
    col = df["Close"]
    if isinstance(col, pd.DataFrame):
        return col.iloc[:, 0]
    return col


# ─────────────────────────────────────────────────────────────────────────────
# 1. Precios de activos
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"Descargando precios de activos {START} → {END}")
print(f"{'='*60}")

rows_precios = []
errores = []

for codigo, ticker in ACTIVOS.items():
    try:
        df = yf.download(ticker, start=START, end=END, progress=False, auto_adjust=True)
        if df.empty:
            errores.append(f"{ticker}: sin datos")
            print(f"  ✗ {ticker:12s} → sin datos")
            continue
        close = extraer_close(df)
        count = 0
        for fecha, valor in close.items():
            v = float(valor)
            if v > 0:
                rows_precios.append({
                    "activocodigo": codigo,
                    "fecha": str(fecha.date()),
                    "valor": round(v, 6),
                })
                count += 1
        print(f"  ✓ {ticker:12s} → {count} días")
    except Exception as e:
        errores.append(f"{ticker}: {e}")
        print(f"  ✗ {ticker:12s} → {e}")

print(f"\nTotal filas de precios: {len(rows_precios)}")

if rows_precios:
    BATCH = 500
    inserted = 0
    for i in range(0, len(rows_precios), BATCH):
        batch = rows_precios[i : i + BATCH]
        supabase.table("valorhistoricoactivo").upsert(
            batch, on_conflict="activocodigo,fecha"
        ).execute()
        inserted += len(batch)
    print(f"✓ {inserted} filas de precios subidas a Supabase.")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Tipos de cambio reales
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"Descargando tipos de cambio {START} → {END}")
print(f"{'='*60}")

rows_cambios = []

for (origen, destino), ticker in FOREX_TICKERS.items():
    try:
        df = yf.download(ticker, start=START, end=END, progress=False, auto_adjust=True)
        if df.empty:
            errores.append(f"Forex {ticker}: sin datos")
            print(f"  ✗ {origen}→{destino} ({ticker}): sin datos")
            continue
        close = extraer_close(df)
        count = 0
        for fecha, valor in close.items():
            v = float(valor)
            if v > 0:
                fecha_str = str(fecha.date())
                rows_cambios.append({
                    "divisaorigen": origen,
                    "divisadestino": destino,
                    "fecini": fecha_str,
                    "fecfin": fecha_str,
                    "cambio": round(v, 6),
                })
                count += 1
        print(f"  ✓ {origen}→{destino:4s} ({ticker:10s}) → {count} días  (ej: {round(float(close.iloc[-1]), 4)})")
    except Exception as e:
        errores.append(f"Forex {origen}→{destino}: {e}")
        print(f"  ✗ {origen}→{destino}: {e}")

print(f"\nTotal filas de cambios: {len(rows_cambios)}")

if rows_cambios:
    BATCH = 500
    inserted = 0
    for i in range(0, len(rows_cambios), BATCH):
        batch = rows_cambios[i : i + BATCH]
        supabase.table("cambios").upsert(
            batch, on_conflict="divisaorigen,divisadestino,fecini"
        ).execute()
        inserted += len(batch)
    print(f"✓ {inserted} filas de tipos de cambio subidas a Supabase.")


# ─────────────────────────────────────────────────────────────────────────────
# Resumen
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"COMPLETADO")
print(f"  Precios de activos : {len(rows_precios)} filas")
print(f"  Tipos de cambio    : {len(rows_cambios)} filas")
if errores:
    print(f"\nErrores ({len(errores)}):")
    for e in errores:
        print(f"  - {e}")
print(f"{'='*60}\n")
