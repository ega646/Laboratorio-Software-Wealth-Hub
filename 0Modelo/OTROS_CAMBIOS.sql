ALTER TABLE activosposeidos
ADD CONSTRAINT activosposeidos_usuario_fk
FOREIGN KEY (usuario_id)
REFERENCES perfiles(id)
ON DELETE CASCADE;