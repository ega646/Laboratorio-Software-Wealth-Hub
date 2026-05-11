"""
Carga 5 años de precios diarios reales en Supabase usando Yahoo Finance.
Lee los códigos de activos directamente de la BD — nunca hardcodeados.

Uso:
  source .venv/bin/activate
  pip install yfinance supabase python-dotenv pandas
  python scripts/cargar_5años.py
"""

import os
import datetime
import concurrent.futures
import pandas as pd
import yfinance as yf
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(".env.local")
load_dotenv(".env")

url = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
supabase = create_client(url, key)

END   = datetime.date.today()
START = END - datetime.timedelta(days=5 * 365)
BATCH = 500

FOREX = {
    ("EUR", "USD"): "EURUSD=X",
    ("USD", "EUR"): "USDEUR=X",
    ("EUR", "GBP"): "EURGBP=X",
    ("GBP", "EUR"): "GBPEUR=X",
    ("USD", "GBP"): "USDGBP=X",
    ("GBP", "USD"): "GBPUSD=X",
}


def a_yahoo_ticker(simbolo: str, tipocodigo: str) -> str:
    """Convierte el símbolo interno al ticker de Yahoo Finance."""
    if tipocodigo == "CRYPTO":
        return f"{simbolo}-USD"
    # Yahoo usa guión en vez de punto: BRK.B → BRK-B
    return simbolo.replace(".", "-")


def extraer_close(df: pd.DataFrame) -> pd.Series:
    col = df["Close"]
    if isinstance(col, pd.DataFrame):
        return col.iloc[:, 0]
    return col


def descargar_activo(args):
    codigo, ticker, yahoo_ticker = args
    try:
        df = yf.download(yahoo_ticker, start=START, end=END,
                         progress=False, auto_adjust=True)
        if df.empty:
            return codigo, ticker, [], "sin datos"
        close = extraer_close(df)
        filas = [
            {"activocodigo": codigo, "fecha": str(f.date()), "valor": round(float(v), 6)}
            for f, v in close.items() if float(v) > 0
        ]
        return codigo, ticker, filas, None
    except Exception as e:
        return codigo, ticker, [], str(e)


def descargar_forex(args):
    (origen, destino), ticker = args
    try:
        df = yf.download(ticker, start=START, end=END,
                         progress=False, auto_adjust=True)
        if df.empty:
            return origen, destino, ticker, [], "sin datos"
        close = extraer_close(df)
        filas = [
            {
                "divisaorigen": origen, "divisadestino": destino,
                "fecini": str(f.date()), "fecfin": str(f.date()),
                "cambio": round(float(v), 6),
            }
            for f, v in close.items() if float(v) > 0
        ]
        return origen, destino, ticker, filas, None
    except Exception as e:
        return origen, destino, ticker, [], str(e)


def subir(tabla: str, filas: list, conflict: str) -> int:
    total = 0
    for i in range(0, len(filas), BATCH):
        supabase.table(tabla).upsert(
            filas[i:i+BATCH], on_conflict=conflict
        ).execute()
        total += len(filas[i:i+BATCH])
    return total


# ─── 1. Leer activos reales de Supabase ───────────────────────
print("\nLeyendo catálogo de activos desde Supabase...")
res = supabase.table("activos").select(
    "codigo, simbolo, tipocodigo, descripcion"
).order("codigo").execute()

# Filtrar en Python los activos que tienen símbolo (EFECTIVO y PROPIEDAD no tienen)
activos_bd = [a for a in res.data if a.get("simbolo")]
if not activos_bd:
    print("ERROR: no hay activos con símbolo en la BD.")
    exit(1)

# Construir lista de tareas: (codigo, simbolo_interno, yahoo_ticker)
tareas = [
    (a["codigo"], a["simbolo"], a_yahoo_ticker(a["simbolo"], a["tipocodigo"]))
    for a in activos_bd
]

print(f"  {len(tareas)} activos encontrados:")
for codigo, simbolo, yticker in tareas:
    print(f"    codigo={codigo:3d}  simbolo={simbolo:10s}  → yahoo={yticker}")


# ─── 2. Descargar precios en paralelo ─────────────────────────
print(f"\n{'='*60}")
print(f"  Precios: {START} → {END}  ({len(tareas)} activos, 5 años)")
print(f"{'='*60}")

todas_precios = []
errores = []

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    resultados = list(ex.map(descargar_activo, tareas))

for codigo, ticker, filas, err in resultados:
    if err:
        errores.append(f"{ticker} (código {codigo}): {err}")
        print(f"  ✗ {ticker:12s} → {err}")
    else:
        todas_precios.extend(filas)
        print(f"  ✓ {ticker:12s} → {len(filas)} días")

print(f"\n  Total: {len(todas_precios):,} filas")
if todas_precios:
    n = subir("valorhistoricoactivo", todas_precios, "activocodigo,fecha")
    print(f"  ✓ {n:,} filas subidas a valorhistoricoactivo")


# ─── 3. Tipos de cambio ───────────────────────────────────────
print(f"\n{'='*60}")
print(f"  Tipos de cambio ({len(FOREX)} pares forex)")
print(f"{'='*60}")

todas_forex = []

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
    res_forex = list(ex.map(descargar_forex, FOREX.items()))

for origen, destino, ticker, filas, err in res_forex:
    if err:
        errores.append(f"Forex {ticker}: {err}")
        print(f"  ✗ {origen}→{destino}: {err}")
    else:
        todas_forex.extend(filas)
        ej = round(filas[-1]["cambio"], 4) if filas else "—"
        print(f"  ✓ {origen}→{destino:4s} ({ticker:10s}) → {len(filas)} días  (último: {ej})")

print(f"\n  Total: {len(todas_forex):,} filas")
if todas_forex:
    n = subir("cambios", todas_forex, "divisaorigen,divisadestino,fecini")
    print(f"  ✓ {n:,} filas subidas a cambios")


# ─── Resumen ──────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"  COMPLETADO")
print(f"  Precios  : {len(todas_precios):,} filas")
print(f"  Cambios  : {len(todas_forex):,} filas")
if errores:
    print(f"\n  Advertencias ({len(errores)}):")
    for e in errores:
        print(f"    - {e}")
print(f"{'='*60}\n")
