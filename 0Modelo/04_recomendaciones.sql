-- ============================================================
-- WEALTH HUB — Tabla recomendaciones (UC14)
-- Ejecutar DESPUÉS de 00_tablas.sql y 01_rls_y_trigger.sql
--
-- Almacena alertas calculadas por el sistema sobre la cartera
-- del usuario (desbalance respecto al perfil de riesgo, etc.).
-- Idempotente: usa CREATE TABLE IF NOT EXISTS y DROP POLICY IF EXISTS
-- ============================================================


-- ============================================================
-- 1. Tabla recomendaciones
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recomendaciones (
    id                  BIGSERIAL    PRIMARY KEY,
    usuario_id          UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo                VARCHAR(40)  NOT NULL,            -- p.ej. 'desbalance_cartera'
    severidad           VARCHAR(10)  NOT NULL DEFAULT 'info'
                        CHECK (severidad IN ('info', 'warn', 'critical')),
    titulo              TEXT         NOT NULL,
    mensaje             TEXT         NOT NULL,
    datos_json          JSONB        DEFAULT '{}'::jsonb, -- detalles estructurados (cálculos, target, actual)
    estado              VARCHAR(15)  NOT NULL DEFAULT 'activa'
                        CHECK (estado IN ('activa', 'ignorada', 'recordar')),
    fecha_creacion      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    fecha_recordatorio  TIMESTAMPTZ                       -- si estado='recordar', cuándo volver a activar
);

CREATE INDEX IF NOT EXISTS idx_recomendaciones_usuario
    ON public.recomendaciones(usuario_id, estado);


-- ============================================================
-- 2. Row Level Security: cada usuario gestiona solo las suyas
-- ============================================================
ALTER TABLE public.recomendaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve sus recomendaciones"        ON public.recomendaciones;
DROP POLICY IF EXISTS "Usuario inserta sus recomendaciones"   ON public.recomendaciones;
DROP POLICY IF EXISTS "Usuario actualiza sus recomendaciones" ON public.recomendaciones;
DROP POLICY IF EXISTS "Usuario borra sus recomendaciones"     ON public.recomendaciones;

CREATE POLICY "Usuario ve sus recomendaciones"
    ON public.recomendaciones FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario inserta sus recomendaciones"
    ON public.recomendaciones FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuario actualiza sus recomendaciones"
    ON public.recomendaciones FOR UPDATE
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario borra sus recomendaciones"
    ON public.recomendaciones FOR DELETE
    USING (auth.uid() = usuario_id);
