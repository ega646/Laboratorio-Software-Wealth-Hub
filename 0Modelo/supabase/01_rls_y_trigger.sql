-- ============================================================
-- WEALTH HUB — Row Level Security + Trigger de perfil
-- Ejecutar DESPUÉS de 00_tablas.sql
--
-- Idempotente: usa DROP POLICY IF EXISTS antes de cada CREATE POLICY
-- para que pueda relanzarse sin errores.
-- ============================================================


-- ============================================================
-- Tablas de catálogo: lectura pública, sin escritura desde cliente
-- ============================================================
ALTER TABLE public.idiomas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles_riesgo      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiposcuentas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiposactivos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valorhistoricoactivo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cambios              ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de idiomas"              ON public.idiomas;
DROP POLICY IF EXISTS "Lectura pública de divisas"              ON public.divisas;
DROP POLICY IF EXISTS "Lectura pública de perfiles_riesgo"      ON public.perfiles_riesgo;
DROP POLICY IF EXISTS "Lectura pública de tiposcuentas"         ON public.tiposcuentas;
DROP POLICY IF EXISTS "Lectura pública de tiposactivos"         ON public.tiposactivos;
DROP POLICY IF EXISTS "Lectura pública de activos"              ON public.activos;
DROP POLICY IF EXISTS "Lectura pública de valorhistoricoactivo" ON public.valorhistoricoactivo;
DROP POLICY IF EXISTS "Lectura pública de cambios"              ON public.cambios;

CREATE POLICY "Lectura pública de idiomas"              ON public.idiomas              FOR SELECT USING (true);
CREATE POLICY "Lectura pública de divisas"              ON public.divisas              FOR SELECT USING (true);
CREATE POLICY "Lectura pública de perfiles_riesgo"      ON public.perfiles_riesgo      FOR SELECT USING (true);
CREATE POLICY "Lectura pública de tiposcuentas"         ON public.tiposcuentas         FOR SELECT USING (true);
CREATE POLICY "Lectura pública de tiposactivos"         ON public.tiposactivos         FOR SELECT USING (true);
CREATE POLICY "Lectura pública de activos"              ON public.activos              FOR SELECT USING (true);
CREATE POLICY "Lectura pública de valorhistoricoactivo" ON public.valorhistoricoactivo FOR SELECT USING (true);
CREATE POLICY "Lectura pública de cambios"              ON public.cambios              FOR SELECT USING (true);


-- ============================================================
-- perfiles: cada usuario solo puede ver y editar el suyo
-- ============================================================
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve su propio perfil"      ON public.perfiles;
DROP POLICY IF EXISTS "Usuario actualiza su propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Insert de perfil solo via trigger" ON public.perfiles;

CREATE POLICY "Usuario ve su propio perfil"
    ON public.perfiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Usuario actualiza su propio perfil"
    ON public.perfiles FOR UPDATE
    USING (auth.uid() = id);

-- El INSERT solo lo realiza el trigger (SECURITY DEFINER), no el cliente
CREATE POLICY "Insert de perfil solo via trigger"
    ON public.perfiles FOR INSERT
    WITH CHECK (auth.uid() = id);


-- ============================================================
-- cuentas: cada usuario gestiona únicamente las suyas
-- (columna usuario_id añadida en 00_tablas.sql)
-- ============================================================
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve sus cuentas"       ON public.cuentas;
DROP POLICY IF EXISTS "Usuario inserta sus cuentas"  ON public.cuentas;
DROP POLICY IF EXISTS "Usuario actualiza sus cuentas" ON public.cuentas;
DROP POLICY IF EXISTS "Usuario borra sus cuentas"    ON public.cuentas;

CREATE POLICY "Usuario ve sus cuentas"
    ON public.cuentas FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario inserta sus cuentas"
    ON public.cuentas FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuario actualiza sus cuentas"
    ON public.cuentas FOR UPDATE
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario borra sus cuentas"
    ON public.cuentas FOR DELETE
    USING (auth.uid() = usuario_id);


-- ============================================================
-- activosposeidos: cada usuario gestiona únicamente las suyas
-- (columna usuario_id añadida en 00_tablas.sql)
-- ============================================================
ALTER TABLE public.activosposeidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario ve sus activos poseidos"       ON public.activosposeidos;
DROP POLICY IF EXISTS "Usuario inserta sus activos poseidos"  ON public.activosposeidos;
DROP POLICY IF EXISTS "Usuario actualiza sus activos poseidos" ON public.activosposeidos;
DROP POLICY IF EXISTS "Usuario borra sus activos poseidos"    ON public.activosposeidos;

CREATE POLICY "Usuario ve sus activos poseidos"
    ON public.activosposeidos FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario inserta sus activos poseidos"
    ON public.activosposeidos FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuario actualiza sus activos poseidos"
    ON public.activosposeidos FOR UPDATE
    USING (auth.uid() = usuario_id);

CREATE POLICY "Usuario borra sus activos poseidos"
    ON public.activosposeidos FOR DELETE
    USING (auth.uid() = usuario_id);


-- ============================================================
-- Trigger: al registrarse un usuario en Supabase Auth,
-- se crea automáticamente su fila en "perfiles"
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombrecompleto)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombrecompleto', '')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
