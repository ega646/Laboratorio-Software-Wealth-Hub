-- ============================================================
-- 07_bugfixes.sql — Correcciones de bugs detectados en análisis
--
-- Ejecutar en Supabase SQL Editor (o psql) en orden.
-- Todos los cambios son idempotentes (CREATE OR REPLACE / IF).
-- ============================================================


-- ── Fix 1: resumen_portfolio — self-referencing WHERE ────────
-- El parámetro "user_id" colisionaba con la columna "user_id",
-- causando que WHERE user_id = user_id fuera siempre TRUE y
-- devolviera datos de todos los usuarios.
-- DROP necesario porque PostgreSQL no permite renombrar parámetros con CREATE OR REPLACE.
DROP FUNCTION IF EXISTS "public"."resumen_portfolio"(uuid);
CREATE OR REPLACE FUNCTION "public"."resumen_portfolio"("p_user_id" uuid)
RETURNS TABLE(
  activocodigo   integer,
  descripcion    text,
  tipodescripcion text,
  color          text,
  cantidad       numeric,
  precio_compra  numeric,
  precio_actual  numeric,
  valor_actual   numeric
)
LANGUAGE sql AS $$
WITH perfil AS (
  SELECT divisabasecodigo
  FROM perfiles
  WHERE id = p_user_id
),
ultimos_precios AS (
  SELECT DISTINCT ON (v.activocodigo)
    v.activocodigo,
    v.valor,
    v.fecha,
    a.divisacodigo
  FROM valorhistoricoactivo v
  JOIN activos a ON a.codigo = v.activocodigo
  ORDER BY v.activocodigo, v.fecha DESC
)
SELECT
  ap.activocodigo,
  a.descripcion,
  ta.descripcion AS tipodescripcion,
  a.color,
  ap.cantidad,
  ap.precio_compra,
  CASE
    WHEN up.divisacodigo = p.divisabasecodigo THEN up.valor
    ELSE up.valor * c.cambio
  END AS precio_actual,
  ap.cantidad *
  CASE
    WHEN up.divisacodigo = p.divisabasecodigo THEN up.valor
    ELSE up.valor * c.cambio
  END AS valor_actual
FROM activosposeidos ap
JOIN activos a ON a.codigo = ap.activocodigo
LEFT JOIN tiposactivos ta ON ta.codigo = a.tipocodigo
JOIN ultimos_precios up ON up.activocodigo = ap.activocodigo
CROSS JOIN perfil p
LEFT JOIN cambios c ON
  c.divisaorigen   = up.divisacodigo
  AND c.divisadestino = p.divisabasecodigo
  AND c.fecini        <= up.fecha
  AND (c.fecfin IS NULL OR c.fecfin >= up.fecha)
WHERE ap.usuario_id = p_user_id;
$$;


-- ── Fix 2: trg_cambios_no_solapamiento — off-by-one ─────────
-- v_count > 1 dejaba pasar exactamente 1 solapamiento.
-- Corregido a > 0 para rechazar cualquier solapamiento.
CREATE OR REPLACE FUNCTION "public"."trg_cambios_no_solapamiento"()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.cambios c
    WHERE c.divisaorigen  = NEW.divisaorigen
      AND c.divisadestino = NEW.divisadestino
      AND c.fecini        <> NEW.fecini
      AND (
        daterange(c.fecini, COALESCE(c.fecfin, 'infinity'::date), '[]')
        &&
        daterange(NEW.fecini, COALESCE(NEW.fecfin, 'infinity'::date), '[]')
      );

    IF v_count > 0 THEN
        RAISE EXCEPTION 'Solapamiento de rangos en Cambios';
    END IF;

    RETURN NEW;
END;
$$;


-- ── Fix 3: get_historico_activo (4 args) — fecha fija ────────
-- La versión de 4 argumentos aplicaba el tipo de cambio de p_fecha
-- a TODAS las filas históricas. Corregido para usar la fecha propia
-- de cada fila (consistente con la versión de 3 argumentos).
CREATE OR REPLACE FUNCTION "public"."get_historico_activo"(
  "p_activocodigo" integer,
  "p_origen"       character varying,
  "p_destino"      character varying,
  "p_fecha"        date
)
RETURNS TABLE("valor" numeric, "fecha" date)
LANGUAGE sql STABLE AS $$
  SELECT
    convertir_divisa(valor, p_origen, p_destino, fecha) AS valor,
    fecha
  FROM valorhistoricoactivo
  WHERE activocodigo = p_activocodigo
  ORDER BY fecha DESC;
$$;
