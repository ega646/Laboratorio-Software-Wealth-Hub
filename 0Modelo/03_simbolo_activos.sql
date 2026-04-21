-- ============================================================
-- WEALTH HUB — Añadir columna simbolo a activos
-- Ejecutar DESPUÉS de 02_datos_iniciales.sql
--
-- "simbolo" almacena el identificador usado por la API externa:
--   - Para CRYPTO: símbolo estándar del mercado (BTC, ETH, SOL…)
--     El código mapea internamente este símbolo al ID de CoinGecko.
--   - Para INVERSION: ticker de Alpha Vantage (SPY, VWRA, AAPL…)
--   - Para PROPIEDAD u otros: NULL (precio actualizado manualmente)
-- ============================================================

ALTER TABLE public.activos
  ADD COLUMN IF NOT EXISTS simbolo VARCHAR(50);
