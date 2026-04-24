CREATE OR REPLACE FUNCTION convertir_divisa(
  p_valor numeric,
  p_divisa_origen text,
  p_divisa_destino text,
  p_fecha date
)
RETURNS numeric
LANGUAGE plpgsql
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