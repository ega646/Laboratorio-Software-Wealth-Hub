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