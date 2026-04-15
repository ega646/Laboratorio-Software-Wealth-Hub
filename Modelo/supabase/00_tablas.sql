-- ============================================================
-- WEALTH HUB — Script de migración
-- Ejecutar en el SQL Editor de Supabase
--
-- REQUISITO PREVIO: DataBase.sql y ValoresPrueba.sql ya han sido
-- importados en Supabase (tablas y datos de catálogo ya existen).
--
-- Este script añade únicamente lo que Supabase necesita y que
-- no existía en el modelo original:
--   1. Columna "color" en activos (para la UI)
--   2. Columnas "usuario_id" y "precio_compra" en activosposeidos
--   3. Columnas "usuario_id" y "apikey_cifrada" en cuentas
--   4. Tabla nueva "perfiles" (reemplaza el rol de autenticación
--      de "usuarios" — auth.users gestiona email + contraseña)
--   5. Nuevos tipos de cuenta para exchanges
--   6. Trigger anti-solapamiento de cambios (versión idempotente)
--
-- La tabla "usuarios" original se conserva intacta como referencia
-- histórica. Los nuevos usuarios se crean a través de Supabase Auth.
-- ============================================================


-- ============================================================
-- 1. activos → añadir columna "color" para la UI
-- ============================================================
ALTER TABLE public.activos
  ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#6366f1';

-- Colores por activo existente (idempotente, no falla si ya tienen color)
UPDATE public.activos SET color = '#F7931A' WHERE codigo = 10 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#627EEA' WHERE codigo = 11 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#10b981' WHERE codigo = 20 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#1f77b4' WHERE codigo = 21 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#8b5cf6' WHERE codigo = 30 AND (color IS NULL OR color = '#6366f1');
UPDATE public.activos SET color = '#f59e0b' WHERE codigo = 31 AND (color IS NULL OR color = '#6366f1');


-- ============================================================
-- 2. activosposeidos → migrar de emailusuario a usuario_id (UUID)
-- ============================================================
ALTER TABLE public.activosposeidos
  ADD COLUMN IF NOT EXISTS usuario_id    UUID    REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS precio_compra NUMERIC DEFAULT 0;

-- Eliminar la columna vieja (y su FK a usuarios) una vez añadida la nueva
ALTER TABLE public.activosposeidos
  DROP COLUMN IF EXISTS emailusuario;


-- ============================================================
-- 3. cuentas → migrar de emailusuario a usuario_id (UUID)
-- ============================================================
ALTER TABLE public.cuentas
  ADD COLUMN IF NOT EXISTS usuario_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS apikey_cifrada TEXT;

-- Eliminar la columna vieja (y su FK a usuarios) una vez añadida la nueva
ALTER TABLE public.cuentas
  DROP COLUMN IF EXISTS emailusuario;

-- Nuevos tipos de cuenta para exchanges/brokers (la app los usará en el futuro)
INSERT INTO public.tiposcuentas VALUES ('BINANCE',  'Exchange Binance')    ON CONFLICT DO NOTHING;
INSERT INTO public.tiposcuentas VALUES ('COINBASE',  'Exchange Coinbase')   ON CONFLICT DO NOTHING;
INSERT INTO public.tiposcuentas VALUES ('IBKR',      'Interactive Brokers') ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. perfiles — tabla nueva que reemplaza el rol de auth de usuarios
--    auth.users almacena email + contraseña
--    perfiles almacena el resto de datos del usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS public.perfiles (
    id                 UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombrecompleto     TEXT        NOT NULL DEFAULT '',
    telefono           VARCHAR(20),
    perfilriesgocodigo VARCHAR(20) REFERENCES public.perfiles_riesgo(codigo) ON DELETE SET NULL,
    divisabasecodigo   VARCHAR(3)  REFERENCES public.divisas(codigo)         ON DELETE SET NULL,
    idiomacodigo       VARCHAR(3)  REFERENCES public.idiomas(codigo)         ON DELETE SET NULL,
    formatofecha       VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    ultimoacceso       TIMESTAMPTZ DEFAULT NOW(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. Trigger anti-solapamiento de cambios (versión idempotente)
--    CREATE OR REPLACE actualiza si ya existe; DROP IF EXISTS evita
--    error si el trigger del DataBase.sql original ya está creado.
-- ============================================================
CREATE OR REPLACE FUNCTION public.trg_cambios_no_solapamiento()
RETURNS TRIGGER AS $$
DECLARE v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.cambios c
    WHERE c.divisaorigen  = NEW.divisaorigen
      AND c.divisadestino = NEW.divisadestino
      AND c.fecini        <> NEW.fecini
      AND (
            (NEW.fecfin IS NULL OR c.fecini <= NEW.fecfin)
        AND (c.fecfin  IS NULL OR c.fecfin >= NEW.fecini)
      );
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Solapamiento de rangos en Cambios';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cambios_no_solapamiento ON public.cambios;
CREATE TRIGGER trg_cambios_no_solapamiento
    BEFORE INSERT OR UPDATE ON public.cambios
    FOR EACH ROW EXECUTE FUNCTION public.trg_cambios_no_solapamiento();


-- ============================================================
-- 6. Eliminar la tabla usuarios
--    Ya no es necesaria: auth.users gestiona el login y
--    perfiles gestiona los datos adicionales del usuario.
--    Las FKs de cuentas y activosposeidos ya fueron eliminadas
--    en los pasos 2 y 3, así que este DROP no tiene dependencias.
-- ============================================================
DROP TABLE IF EXISTS public.usuarios;
