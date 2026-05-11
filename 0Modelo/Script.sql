


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."convertir_divisa"("p_valor" numeric, "p_divisa_origen" "text", "p_divisa_destino" "text", "p_fecha" "date") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_cambio numeric;
BEGIN
  -- 1. Si son iguales
  IF p_divisa_origen = p_divisa_destino THEN
    RETURN p_valor;
  END IF;

  -- 2. Intento directo
  SELECT c.cambio INTO v_cambio
  FROM cambios c
  WHERE c.divisaorigen = p_divisa_origen
    AND c.divisadestino = p_divisa_destino
    AND c.fecini <= p_fecha
    AND (c.fecfin IS NULL OR c.fecfin >= p_fecha)
  ORDER BY c.fecini DESC
  LIMIT 1;

  IF v_cambio IS NOT NULL THEN
    RETURN p_valor * v_cambio;
  END IF;

  -- 3. Intento inverso
  SELECT c.cambio INTO v_cambio
  FROM cambios c
  WHERE c.divisaorigen = p_divisa_destino
    AND c.divisadestino = p_divisa_origen
    AND c.fecini <= p_fecha
    AND (c.fecfin IS NULL OR c.fecfin >= p_fecha)
  ORDER BY c.fecini DESC
  LIMIT 1;

  IF v_cambio IS NOT NULL THEN
    RETURN p_valor / v_cambio;
  END IF;

  -- 4. Si no hay nada → error
  RAISE EXCEPTION 'No hay tipo de cambio para % -> % en %',
    p_divisa_origen, p_divisa_destino, p_fecha;

END;
$$;


ALTER FUNCTION "public"."convertir_divisa"("p_valor" numeric, "p_divisa_origen" "text", "p_divisa_destino" "text", "p_fecha" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying) RETURNS TABLE("valor" numeric, "fecha" "date")
    LANGUAGE "sql" STABLE
    AS $$
  select
    convertir_divisa(valor, p_origen, p_destino, fecha) valor,
    fecha
  from valorhistoricoactivo
  where activocodigo = p_activocodigo
  order by fecha desc;
$$;


ALTER FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying, "p_fecha" "date") RETURNS TABLE("valor" numeric, "fecha" "date")
    LANGUAGE "sql" STABLE
    AS $$
  select
    convertir_divisa(valor, p_origen, p_destino, fecha) valor,
    fecha
  from valorhistoricoactivo
  where activocodigo = p_activocodigo
  order by fecha desc;
$$;


ALTER FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying, "p_fecha" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."resumen_portfolio"("p_user_id" "uuid") RETURNS TABLE("activocodigo" integer, "descripcion" "text", "tipodescripcion" "text", "color" "text", "cantidad" numeric, "precio_compra" numeric, "precio_actual" numeric, "valor_actual" numeric)
    LANGUAGE "sql"
    AS $$
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
),
cambios_activos AS (
  SELECT
    c.divisaorigen,
    c.divisadestino,
    c.cambio,
    c.fecini,
    c.fecfin
  FROM cambios c
)
SELECT
  ap.activocodigo,
  a.descripcion,
  ta.descripcion AS tipodescripcion,
  a.color,
  ap.cantidad,
  ap.precio_compra,

  -- precio convertido
  CASE
    WHEN up.divisacodigo = p.divisabasecodigo THEN up.valor
    ELSE up.valor * c.cambio
  END AS precio_actual,

  -- valor total
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
  c.divisaorigen = up.divisacodigo AND
  c.divisadestino = p.divisabasecodigo AND
  c.fecini <= up.fecha AND
  (c.fecfin IS NULL OR c.fecfin >= up.fecha)

WHERE ap.usuario_id = p_user_id;
$$;


ALTER FUNCTION "public"."resumen_portfolio"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_cambios_no_solapamiento"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE v_count INTEGER;
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
END;$$;


ALTER FUNCTION "public"."trg_cambios_no_solapamiento"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activos" (
    "codigo" integer NOT NULL,
    "descripcion" character varying(200),
    "tipocodigo" character varying(20),
    "divisacodigo" character varying(3),
    "color" character varying(7) DEFAULT '#6366f1'::character varying,
    "simbolo" character varying(50)
);


ALTER TABLE "public"."activos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activosposeidos" (
    "activocodigo" integer NOT NULL,
    "cantidad" numeric,
    "fechainicio" "date",
    "usuario_id" "uuid",
    "precio_compra" numeric DEFAULT 0,
    "id" bigint NOT NULL
);


ALTER TABLE "public"."activosposeidos" OWNER TO "postgres";


ALTER TABLE "public"."activosposeidos" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."activosposeidos_idRelacion_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cambios" (
    "divisaorigen" character varying(3) NOT NULL,
    "divisadestino" character varying(3) NOT NULL,
    "fecini" "date" NOT NULL,
    "fecfin" "date",
    "cambio" numeric,
    CONSTRAINT "cambios_check" CHECK ((("fecfin" IS NULL) OR ("fecfin" >= "fecini"))),
    CONSTRAINT "cambios_check1" CHECK ((("divisaorigen")::"text" <> ("divisadestino")::"text"))
);


ALTER TABLE "public"."cambios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cuentas" (
    "tipocuentacodigo" character varying(20) NOT NULL,
    "numerocuenta" integer NOT NULL,
    "fechaenlace" "date",
    "activa" boolean,
    "usuario_id" "uuid",
    "apikey_cifrada" "text"
);


ALTER TABLE "public"."cuentas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."divisas" (
    "codigo" character varying(3) NOT NULL,
    "descripcion" character varying(200) NOT NULL,
    "simbolo_divisa" character varying
);


ALTER TABLE "public"."divisas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."idiomas" (
    "codigo" character varying(3) NOT NULL,
    "descripcion" character varying(200) NOT NULL
);


ALTER TABLE "public"."idiomas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfiles" (
    "id" "uuid" NOT NULL,
    "nombrecompleto" "text" DEFAULT ''::"text" NOT NULL,
    "telefono" character varying(20),
    "perfilriesgocodigo" character varying(20),
    "divisabasecodigo" character varying(3) DEFAULT 'EUR'::character varying,
    "idiomacodigo" character varying(3),
    "formatofecha" character varying(20) DEFAULT 'DD/MM/YYYY'::character varying,
    "ultimoacceso" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."perfiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfiles_riesgo" (
    "codigo" character varying(20) NOT NULL,
    "descripcion" character varying(200) NOT NULL
);


ALTER TABLE "public"."perfiles_riesgo" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tiposactivos" (
    "codigo" character varying(20) NOT NULL,
    "descripcion" character varying(200),
    "logo" character varying(500),
    "riesgocodigo" character varying(20) NOT NULL
);


ALTER TABLE "public"."tiposactivos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tiposcuentas" (
    "codigo" character varying(20) NOT NULL,
    "descripcion" character varying(200) NOT NULL
);


ALTER TABLE "public"."tiposcuentas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."valorhistoricoactivo" (
    "activocodigo" integer NOT NULL,
    "fecha" "date" NOT NULL,
    "valor" numeric
);


ALTER TABLE "public"."valorhistoricoactivo" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activos"
    ADD CONSTRAINT "activos_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."activosposeidos"
    ADD CONSTRAINT "activosposeidos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cambios"
    ADD CONSTRAINT "cambios_pkey" PRIMARY KEY ("divisaorigen", "divisadestino", "fecini");



ALTER TABLE ONLY "public"."divisas"
    ADD CONSTRAINT "divisas_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."idiomas"
    ADD CONSTRAINT "idiomas_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfiles_riesgo"
    ADD CONSTRAINT "perfiles_riesgo_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."tiposactivos"
    ADD CONSTRAINT "tiposactivos_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."tiposcuentas"
    ADD CONSTRAINT "tiposcuentas_pkey" PRIMARY KEY ("codigo");



ALTER TABLE ONLY "public"."valorhistoricoactivo"
    ADD CONSTRAINT "valorhistoricoactivo_pkey" PRIMARY KEY ("activocodigo", "fecha");



CREATE OR REPLACE TRIGGER "trg_cambios_no_solapamiento" BEFORE INSERT OR UPDATE ON "public"."cambios" FOR EACH ROW EXECUTE FUNCTION "public"."trg_cambios_no_solapamiento"();



ALTER TABLE ONLY "public"."activos"
    ADD CONSTRAINT "activos_divisacodigo_fkey" FOREIGN KEY ("divisacodigo") REFERENCES "public"."divisas"("codigo");



ALTER TABLE ONLY "public"."activos"
    ADD CONSTRAINT "activos_tipocodigo_fkey" FOREIGN KEY ("tipocodigo") REFERENCES "public"."tiposactivos"("codigo");



ALTER TABLE ONLY "public"."activosposeidos"
    ADD CONSTRAINT "activosposeidos_activocodigo_fkey" FOREIGN KEY ("activocodigo") REFERENCES "public"."activos"("codigo") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activosposeidos"
    ADD CONSTRAINT "activosposeidos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activosposeidos"
    ADD CONSTRAINT "activosposeidos_usuario_id_fkey1" FOREIGN KEY ("usuario_id") REFERENCES "public"."perfiles"("id");



ALTER TABLE ONLY "public"."cambios"
    ADD CONSTRAINT "cambios_divisadestino_fkey" FOREIGN KEY ("divisadestino") REFERENCES "public"."divisas"("codigo");



ALTER TABLE ONLY "public"."cambios"
    ADD CONSTRAINT "cambios_divisaorigen_fkey" FOREIGN KEY ("divisaorigen") REFERENCES "public"."divisas"("codigo");



ALTER TABLE ONLY "public"."cuentas"
    ADD CONSTRAINT "cuentas_tipocuentacodigo_fkey" FOREIGN KEY ("tipocuentacodigo") REFERENCES "public"."tiposcuentas"("codigo") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cuentas"
    ADD CONSTRAINT "cuentas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_divisabasecodigo_fkey" FOREIGN KEY ("divisabasecodigo") REFERENCES "public"."divisas"("codigo") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_idiomacodigo_fkey" FOREIGN KEY ("idiomacodigo") REFERENCES "public"."idiomas"("codigo") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_perfilriesgocodigo_fkey" FOREIGN KEY ("perfilriesgocodigo") REFERENCES "public"."perfiles_riesgo"("codigo") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tiposactivos"
    ADD CONSTRAINT "tiposactivos_riesgocodigo_fkey" FOREIGN KEY ("riesgocodigo") REFERENCES "public"."perfiles_riesgo"("codigo");



ALTER TABLE ONLY "public"."valorhistoricoactivo"
    ADD CONSTRAINT "valorhistoricoactivo_activocodigo_fkey" FOREIGN KEY ("activocodigo") REFERENCES "public"."activos"("codigo") ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "public"."activos" FOR SELECT USING (true);



CREATE POLICY "Insert de perfil solo via trigger" ON "public"."perfiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Lectura pública de activos" ON "public"."activos" FOR SELECT USING (true);



CREATE POLICY "Lectura pública de cambios" ON "public"."cambios" FOR SELECT USING (true);



CREATE POLICY "Lectura pública de divisas" ON "public"."divisas" FOR SELECT USING (true);



CREATE POLICY "Lectura pública de idiomas" ON "public"."idiomas" FOR SELECT USING (true);



CREATE POLICY "Lectura pública de perfiles_riesgo" ON "public"."perfiles_riesgo" FOR SELECT USING (true);



CREATE POLICY "Lectura pública de tiposactivos" ON "public"."tiposactivos" FOR SELECT USING (true);



CREATE POLICY "Lectura pública de tiposcuentas" ON "public"."tiposcuentas" FOR SELECT USING (true);



CREATE POLICY "Lectura pública de valorhistoricoactivo" ON "public"."valorhistoricoactivo" FOR SELECT USING (true);



CREATE POLICY "Usuario actualiza su propio perfil" ON "public"."perfiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuario actualiza sus activos poseidos" ON "public"."activosposeidos" FOR UPDATE USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuario actualiza sus cuentas" ON "public"."cuentas" FOR UPDATE USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuario borra sus activos poseidos" ON "public"."activosposeidos" FOR DELETE USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuario borra sus cuentas" ON "public"."cuentas" FOR DELETE USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuario inserta sus activos poseidos" ON "public"."activosposeidos" FOR INSERT WITH CHECK (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuario inserta sus cuentas" ON "public"."cuentas" FOR INSERT WITH CHECK (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuario ve su propio perfil" ON "public"."perfiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Usuario ve sus activos poseidos" ON "public"."activosposeidos" FOR SELECT USING (("auth"."uid"() = "usuario_id"));



CREATE POLICY "Usuario ve sus cuentas" ON "public"."cuentas" FOR SELECT USING (("auth"."uid"() = "usuario_id"));



ALTER TABLE "public"."activos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activosposeidos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cambios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cuentas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."divisas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."idiomas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."perfiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."perfiles_riesgo" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiposactivos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiposcuentas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."valorhistoricoactivo" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."convertir_divisa"("p_valor" numeric, "p_divisa_origen" "text", "p_divisa_destino" "text", "p_fecha" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."convertir_divisa"("p_valor" numeric, "p_divisa_origen" "text", "p_divisa_destino" "text", "p_fecha" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convertir_divisa"("p_valor" numeric, "p_divisa_origen" "text", "p_divisa_destino" "text", "p_fecha" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying, "p_fecha" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying, "p_fecha" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_historico_activo"("p_activocodigo" integer, "p_origen" character varying, "p_destino" character varying, "p_fecha" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."resumen_portfolio"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."resumen_portfolio"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."resumen_portfolio"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_cambios_no_solapamiento"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_cambios_no_solapamiento"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_cambios_no_solapamiento"() TO "service_role";


















GRANT ALL ON TABLE "public"."activos" TO "anon";
GRANT ALL ON TABLE "public"."activos" TO "authenticated";
GRANT ALL ON TABLE "public"."activos" TO "service_role";



GRANT ALL ON TABLE "public"."activosposeidos" TO "anon";
GRANT ALL ON TABLE "public"."activosposeidos" TO "authenticated";
GRANT ALL ON TABLE "public"."activosposeidos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."activosposeidos_idRelacion_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."activosposeidos_idRelacion_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."activosposeidos_idRelacion_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cambios" TO "anon";
GRANT ALL ON TABLE "public"."cambios" TO "authenticated";
GRANT ALL ON TABLE "public"."cambios" TO "service_role";



GRANT ALL ON TABLE "public"."cuentas" TO "anon";
GRANT ALL ON TABLE "public"."cuentas" TO "authenticated";
GRANT ALL ON TABLE "public"."cuentas" TO "service_role";



GRANT ALL ON TABLE "public"."divisas" TO "anon";
GRANT ALL ON TABLE "public"."divisas" TO "authenticated";
GRANT ALL ON TABLE "public"."divisas" TO "service_role";



GRANT ALL ON TABLE "public"."idiomas" TO "anon";
GRANT ALL ON TABLE "public"."idiomas" TO "authenticated";
GRANT ALL ON TABLE "public"."idiomas" TO "service_role";



GRANT ALL ON TABLE "public"."perfiles" TO "anon";
GRANT ALL ON TABLE "public"."perfiles" TO "authenticated";
GRANT ALL ON TABLE "public"."perfiles" TO "service_role";



GRANT ALL ON TABLE "public"."perfiles_riesgo" TO "anon";
GRANT ALL ON TABLE "public"."perfiles_riesgo" TO "authenticated";
GRANT ALL ON TABLE "public"."perfiles_riesgo" TO "service_role";



GRANT ALL ON TABLE "public"."tiposactivos" TO "anon";
GRANT ALL ON TABLE "public"."tiposactivos" TO "authenticated";
GRANT ALL ON TABLE "public"."tiposactivos" TO "service_role";



GRANT ALL ON TABLE "public"."tiposcuentas" TO "anon";
GRANT ALL ON TABLE "public"."tiposcuentas" TO "authenticated";
GRANT ALL ON TABLE "public"."tiposcuentas" TO "service_role";



GRANT ALL ON TABLE "public"."valorhistoricoactivo" TO "anon";
GRANT ALL ON TABLE "public"."valorhistoricoactivo" TO "authenticated";
GRANT ALL ON TABLE "public"."valorhistoricoactivo" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































