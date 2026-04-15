-- ============================================================
-- WEALTH HUB — Datos iniciales / complementos
-- Ejecutar DESPUÉS de 01_rls_y_trigger.sql
--
-- NOTA: idiomas, divisas, perfiles_riesgo, tiposcuentas,
-- tiposactivos, activos, cambios y valorhistoricoactivo
-- ya existen porque DataBase.sql + ValoresPrueba.sql están
-- importados. Este script solo añade datos que no venían en esos
-- ficheros (nuevos tipos de cuenta, colores de activos).
--
-- Todos los INSERT usan ON CONFLICT DO NOTHING para ser idempotentes.
-- ============================================================


-- ============================================================
-- Complementos de catálogo que no venían en ValoresPrueba.sql
-- ============================================================

-- Tipos de cuenta para exchanges (usados por la sección de cuentas vinculadas)
INSERT INTO public.tiposcuentas VALUES ('BINANCE',  'Exchange Binance')    ON CONFLICT DO NOTHING;
INSERT INTO public.tiposcuentas VALUES ('COINBASE',  'Exchange Coinbase')   ON CONFLICT DO NOTHING;
INSERT INTO public.tiposcuentas VALUES ('IBKR',      'Interactive Brokers') ON CONFLICT DO NOTHING;


-- ============================================================
-- Colores de activos para la UI
-- Se actualizan con WHERE para no machacar colores personalizados
-- ============================================================
UPDATE public.activos SET color = '#F7931A' WHERE codigo = 10 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#627EEA' WHERE codigo = 11 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#10b981' WHERE codigo = 20 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#1f77b4' WHERE codigo = 21 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#8b5cf6' WHERE codigo = 30 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#f59e0b' WHERE codigo = 31 AND (color IS NULL OR color = '#6366f1');


-- ============================================================
-- Historial de precios para los últimos 7 días
-- (ValoresPrueba.sql usaba date_trunc('day', now()) que puede
-- diferir de CURRENT_DATE en zonas horarias; se usa CURRENT_DATE
-- para consistencia con la API)
-- ============================================================
INSERT INTO public.valorhistoricoactivo VALUES (10, CURRENT_DATE-6, 30000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (10, CURRENT_DATE-5, 30500) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (10, CURRENT_DATE-4, 31000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (10, CURRENT_DATE-3, 29500) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (10, CURRENT_DATE-2, 32000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (10, CURRENT_DATE-1, 33000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (10, CURRENT_DATE,   32500) ON CONFLICT DO NOTHING;

INSERT INTO public.valorhistoricoactivo VALUES (11, CURRENT_DATE-6,  2000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (11, CURRENT_DATE-5,  2100) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (11, CURRENT_DATE-4,  2050) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (11, CURRENT_DATE-3,  2200) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (11, CURRENT_DATE-2,  2300) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (11, CURRENT_DATE-1,  2400) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (11, CURRENT_DATE,    2350) ON CONFLICT DO NOTHING;

INSERT INTO public.valorhistoricoactivo VALUES (20, CURRENT_DATE-6,   100) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (20, CURRENT_DATE-5,   102) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (20, CURRENT_DATE-4,   101) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (20, CURRENT_DATE-3,   103) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (20, CURRENT_DATE-2,   104) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (20, CURRENT_DATE-1,   105) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (20, CURRENT_DATE,     106) ON CONFLICT DO NOTHING;

INSERT INTO public.valorhistoricoactivo VALUES (21, CURRENT_DATE-6,    50) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (21, CURRENT_DATE-5,    51) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (21, CURRENT_DATE-4,    52) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (21, CURRENT_DATE-3,    53) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (21, CURRENT_DATE-2,    52) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (21, CURRENT_DATE-1,    54) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (21, CURRENT_DATE,      55) ON CONFLICT DO NOTHING;

INSERT INTO public.valorhistoricoactivo VALUES (30, CURRENT_DATE-6, 200000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (30, CURRENT_DATE-5, 200500) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (30, CURRENT_DATE-4, 201000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (30, CURRENT_DATE-3, 202000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (30, CURRENT_DATE-2, 202500) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (30, CURRENT_DATE-1, 203000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (30, CURRENT_DATE,   203500) ON CONFLICT DO NOTHING;

INSERT INTO public.valorhistoricoactivo VALUES (31, CURRENT_DATE-6, 150000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (31, CURRENT_DATE-5, 150200) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (31, CURRENT_DATE-4, 150500) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (31, CURRENT_DATE-3, 151000) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (31, CURRENT_DATE-2, 151200) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (31, CURRENT_DATE-1, 151500) ON CONFLICT DO NOTHING;
INSERT INTO public.valorhistoricoactivo VALUES (31, CURRENT_DATE,   152000) ON CONFLICT DO NOTHING;
