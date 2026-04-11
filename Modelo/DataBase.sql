-- Version en postgress para poder lanzarse desde supabase

-- Tabla Idiomas
CREATE TABLE idiomas (
    codigo VARCHAR(3) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL
);

-- Tabla Divisas
CREATE TABLE divisas (
    codigo VARCHAR(3) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL
);

-- Tabla Perfiles de riesgo
CREATE TABLE perfiles_riesgo (
    codigo VARCHAR(20) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL
);

-- Tabla Usuarios
CREATE TABLE usuarios (
    email VARCHAR(200) PRIMARY KEY,
    nombrecompleto VARCHAR(200) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    perfilriesgocodigo VARCHAR(20),
    divisabasecodigo VARCHAR(3),
    idiomacodigo VARCHAR(3),
    formatofecha VARCHAR(20),
    fechadecreacion DATE,
    ultimoacceso DATE,

    FOREIGN KEY (perfilriesgocodigo)
        REFERENCES perfiles_riesgo(codigo)
        ON DELETE SET NULL,

    FOREIGN KEY (divisabasecodigo)
        REFERENCES divisas(codigo)
        ON DELETE SET NULL,

    FOREIGN KEY (idiomacodigo)
        REFERENCES idiomas(codigo)
        ON DELETE SET NULL
);

-- Tabla TiposCuentas
CREATE TABLE tiposcueNTAS (
    codigo VARCHAR(20) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL
);

-- Tabla Cuentas
CREATE TABLE cuentas (
    emailusuario VARCHAR(200),
    tipocuentacodigo VARCHAR(20),
    numerocuenta INTEGER,
    fechaenlace DATE,
    activa BOOLEAN,

    PRIMARY KEY (emailusuario, tipocuentacodigo, numerocuenta),

    FOREIGN KEY (emailusuario)
        REFERENCES usuarios(email)
        ON DELETE CASCADE,

    FOREIGN KEY (tipocuentacodigo)
        REFERENCES tiposcueNTAS(codigo)
        ON DELETE CASCADE
);

-- Tabla Cambios
CREATE TABLE cambios (
    divisaorigen VARCHAR(3),
    divisadestino VARCHAR(3),
    fecini DATE,
    fecfin DATE,
    cambio NUMERIC,

    PRIMARY KEY (divisaorigen, divisadestino, fecini),

    FOREIGN KEY (divisaorigen)
        REFERENCES divisas(codigo),

    FOREIGN KEY (divisadestino)
        REFERENCES divisas(codigo),

    CHECK (fecfin IS NULL OR fecfin >= fecini),
    CHECK (divisaorigen <> divisadestino)
);

-- Función del trigger
CREATE OR REPLACE FUNCTION trg_cambios_no_solapamiento()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM cambios c
    WHERE c.divisaorigen = NEW.divisaorigen
      AND c.divisadestino = NEW.divisadestino
      AND c.fecini <> NEW.fecini
      AND (
            (NEW.fecfin IS NULL OR c.fecini <= NEW.fecfin)
        AND (c.fecfin IS NULL OR c.fecfin >= NEW.fecini)
      );

    IF v_count > 0 THEN
        RAISE EXCEPTION 'Solapamiento de rangos en Cambios';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trg_cambios_no_solapamiento
BEFORE INSERT OR UPDATE ON cambios
FOR EACH ROW
EXECUTE FUNCTION trg_cambios_no_solapamiento();

-- Tabla TiposActivos
CREATE TABLE tiposactivos (
    codigo VARCHAR(20) PRIMARY KEY,
    descripcion VARCHAR(200),
    logo VARCHAR(500),
    riesgocodigo VARCHAR(20) NOT NULL,

    FOREIGN KEY (riesgocodigo)
        REFERENCES perfiles_riesgo(codigo)
);

-- Tabla Activos
CREATE TABLE activos (
    codigo INTEGER PRIMARY KEY,
    descripcion VARCHAR(200),
    tipocodigo VARCHAR(20),
    divisacodigo VARCHAR(3),

    FOREIGN KEY (tipocodigo)
        REFERENCES tiposactivos(codigo),

    FOREIGN KEY (divisacodigo)
        REFERENCES divisas(codigo)
);

-- Tabla Valor Historico de Activo
CREATE TABLE valorhistoricoactivo (
    activocodigo INTEGER,
    fecha DATE,
    valor NUMERIC,

    PRIMARY KEY (activocodigo, fecha),

    FOREIGN KEY (activocodigo)
        REFERENCES activos(codigo)
        ON DELETE CASCADE
);

-- Tabla Activos Poseidos
CREATE TABLE activosposeidos (
    emailusuario VARCHAR(200),
    activocodigo INTEGER,
    cantidad NUMERIC,
    fechainicio DATE,

    PRIMARY KEY (emailusuario, activocodigo),

    FOREIGN KEY (emailusuario)
        REFERENCES usuarios(email)
        ON DELETE CASCADE,

    FOREIGN KEY (activocodigo)
        REFERENCES activos(codigo)
        ON DELETE CASCADE
);