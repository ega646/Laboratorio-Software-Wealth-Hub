ALTER TABLE activosposeidos
ADD CONSTRAINT activosposeidos_usuario_fk
FOREIGN KEY (usuario_id)
REFERENCES perfiles(id)
ON DELETE CASCADE;

ALTER TABLE divisas
  ADD COLUMN simbolo_divisa varchar

UPDATE divisas
   SET SIMBOLO_DIVISA = '€'
  WHERE CODIGO = 'EUR'

UPDATE divisas
   SET SIMBOLO_DIVISA = '$'
  WHERE CODIGO = 'USD'

UPDATE divisas
   SET SIMBOLO_DIVISA = '£'
  WHERE CODIGO = 'GBP'


  cambiar el trigger por:

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

    IF v_count > 1 THEN
        RAISE EXCEPTION 'Solapamiento de rangos en Cambios';
    END IF;

    RETURN NEW;
END;

En activosposeidos idRelacion > idrelacion