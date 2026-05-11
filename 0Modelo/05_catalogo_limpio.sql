-- ============================================================
-- WEALTH HUB — Catálogo limpio (tabla rasa)
-- Ejecutar en Supabase SQL Editor
-- ADVERTENCIA: elimina TODAS las posiciones e histórico existentes
-- ============================================================

-- 1. Limpiar datos de usuario
DELETE FROM public.activosposeidos;
DELETE FROM public.valorhistoricoactivo;

-- 2. Limpiar activos existentes
DELETE FROM public.activos;

-- 3. Asegurar que existen todos los tipos necesarios
INSERT INTO public.tiposactivos (codigo, descripcion, logo, riesgocodigo) VALUES
  ('ACCION',       'Acciones',              NULL, 'MEDIO'),
  ('MATERIA_PRIMA','Materias Primas',        NULL, 'MEDIO'),
  ('EFECTIVO',     'Efectivo y depósitos',  NULL, 'BAJO')
ON CONFLICT (codigo) DO NOTHING;

-- 4. Catálogo nuevo con codigos fijos
INSERT INTO public.activos (codigo, descripcion, tipocodigo, divisacodigo, color, simbolo) VALUES

  -- ── CRYPTO (top 10 por market cap) ──────────────────────────
  (10, 'Bitcoin',   'CRYPTO', 'USD', '#F7931A', 'BTC'),
  (11, 'Ethereum',  'CRYPTO', 'USD', '#627EEA', 'ETH'),
  (12, 'BNB',       'CRYPTO', 'USD', '#F3BA2F', 'BNB'),
  (13, 'Solana',    'CRYPTO', 'USD', '#9945FF', 'SOL'),
  (14, 'XRP',       'CRYPTO', 'USD', '#346AA9', 'XRP'),
  (15, 'Dogecoin',  'CRYPTO', 'USD', '#C2A633', 'DOGE'),
  (16, 'Cardano',   'CRYPTO', 'USD', '#0033AD', 'ADA'),
  (17, 'TRON',      'CRYPTO', 'USD', '#FF0013', 'TRX'),
  (18, 'Avalanche', 'CRYPTO', 'USD', '#E84142', 'AVAX'),
  (19, 'Chainlink', 'CRYPTO', 'USD', '#375BD2', 'LINK'),

  -- ── ACCIONES (top 10 US por market cap) ─────────────────────
  (20, 'Apple',       'ACCION', 'USD', '#555555', 'AAPL'),
  (21, 'Microsoft',   'ACCION', 'USD', '#00A4EF', 'MSFT'),
  (22, 'NVIDIA',      'ACCION', 'USD', '#76B900', 'NVDA'),
  (23, 'Amazon',      'ACCION', 'USD', '#FF9900', 'AMZN'),
  (24, 'Alphabet',    'ACCION', 'USD', '#4285F4', 'GOOGL'),
  (25, 'Meta',        'ACCION', 'USD', '#0082FB', 'META'),
  (26, 'Tesla',       'ACCION', 'USD', '#CC0000', 'TSLA'),
  (27, 'Berkshire B', 'ACCION', 'USD', '#6366f1', 'BRK.B'),
  (28, 'Broadcom',    'ACCION', 'USD', '#DC2626', 'AVGO'),
  (29, 'JPMorgan',    'ACCION', 'USD', '#003087', 'JPM'),

  -- ── ETFs ────────────────────────────────────────────────────
  (30, 'S&P 500 (SPY)',    'INVERSION', 'USD', '#1f77b4', 'SPY'),
  (31, 'NASDAQ-100 (QQQ)', 'INVERSION', 'USD', '#2ca02c', 'QQQ'),

  -- ── MATERIAS PRIMAS ─────────────────────────────────────────
  (40, 'Oro (GLD)',    'MATERIA_PRIMA', 'USD', '#D4AF37', 'GLD'),
  (41, 'Plata (SLV)', 'MATERIA_PRIMA', 'USD', '#C0C0C0', 'SLV'),

  -- ── EFECTIVO (precio siempre = 1, cantidad = saldo) ─────────
  (50, 'Cuenta EUR', 'EFECTIVO', 'EUR', '#14b8a6', NULL),
  (51, 'Cuenta USD', 'EFECTIVO', 'USD', '#22c55e', NULL);

-- 5. Reiniciar secuencia de activosposeidos (por si acaso)
SELECT setval(pg_get_serial_sequence('public.activosposeidos', 'id'), 1, false);
