-----------------------------------------------------------------------------------------
-- Cambios aleatorios entre fechas

DELETE FROM Cambios

WITH tasas_base AS (
    SELECT
        d::date AS fecha,
        -- Base con ligera variación controlada
        1.25 + (random() - 0.5) * 0.5 AS eur_usd,
        0.90 + (random() - 0.5) * 0.5 AS eur_gbp
    FROM generate_series('2026-01-01'::date, '2026-04-30'::date, '1 day') d
)
INSERT INTO "public"."cambios" ("divisaorigen", "divisadestino", "fecini", "fecfin", "cambio")
SELECT 'EUR', 'USD', fecha, fecha, ROUND(eur_usd::numeric, 4) FROM tasas_base

UNION ALL
SELECT 'USD', 'EUR', fecha, fecha, ROUND((1/eur_usd)::numeric, 4) FROM tasas_base

UNION ALL
SELECT 'EUR', 'GBP', fecha, fecha, ROUND(eur_gbp::numeric, 4) FROM tasas_base

UNION ALL
SELECT 'GBP', 'EUR', fecha, fecha, ROUND((1/eur_gbp)::numeric, 4) FROM tasas_base

UNION ALL
-- GBP -> USD derivado consistentemente
SELECT 'GBP', 'USD', fecha, fecha, ROUND((eur_usd/eur_gbp)::numeric, 4) FROM tasas_base

UNION ALL
-- USD -> GBP inverso
SELECT 'USD', 'GBP', fecha, fecha, ROUND((eur_gbp/eur_usd)::numeric, 4) FROM tasas_base;


----------------------------------------------------------------------------------------
--- Valores historicos para activos

delete from valorhistoricoactivo

WITH fechas AS (
    SELECT generate_series('2026-01-01'::date, '2026-04-30'::date, '1 day') AS fecha
),
activos_base AS (
    SELECT
        a.codigo,
        a.tipocodigo,
        -- valor inicial según tipo (más realista)
        CASE
            WHEN a.tipocodigo = 'CRYPTO' THEN 100 + random() * 40000
            WHEN a.tipocodigo = 'ACCION' THEN 50 + random() * 500
            WHEN a.tipocodigo = 'INVERSION' THEN 100 + random() * 2000
            WHEN a.tipocodigo = 'PROPIEDAD' THEN 50000 + random() * 300000
            WHEN a.tipocodigo = 'MATERIA_PRIMA' THEN 20 + random() * 2000
            WHEN a.tipocodigo = 'EFECTIVO' THEN 1000 + random() * 10000
            ELSE 100 + random() * 1000
        END AS valor_inicial,

        -- volatilidad diaria según tipo
        CASE
            WHEN a.tipocodigo = 'CRYPTO' THEN 0.08
            WHEN a.tipocodigo = 'ACCION' THEN 0.03
            WHEN a.tipocodigo = 'INVERSION' THEN 0.02
            WHEN a.tipocodigo = 'PROPIEDAD' THEN 0.005
            WHEN a.tipocodigo = 'MATERIA_PRIMA' THEN 0.04
            WHEN a.tipocodigo = 'EFECTIVO' THEN 0.0005
            ELSE 0.02
        END AS volatilidad
    FROM "public"."activos" a
),
serie AS (
    SELECT
        a.codigo,
        f.fecha,
        a.valor_inicial *
        EXP(SUM((random() - 0.5) * a.volatilidad) OVER (
            PARTITION BY a.codigo
            ORDER BY f.fecha
        )) AS valor
    FROM activos_base a
    CROSS JOIN fechas f
)
INSERT INTO "public"."valorhistoricoactivo"
("activocodigo", "fecha", "valor")
SELECT
    codigo,
    fecha,
    ROUND(valor::numeric, 2)
FROM serie
ORDER BY codigo, fecha;