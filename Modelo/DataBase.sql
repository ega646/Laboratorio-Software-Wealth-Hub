-- Crear base de datos (Oracle normalmente usa esquemas, esto es conceptual)
CREATE DATABASE WealthHub;

-- Usar la base de datos
USE WealthHub;

-- Tabla Idiomas
CREATE TABLE Idiomas (
    Codigo VARCHAR2(3) PRIMARY KEY,
    Descripcion VARCHAR2(200) NOT NULL
);

-- Tabla Divisas
CREATE TABLE Divisas (
    Codigo VARCHAR2(3) PRIMARY KEY,
    Descripcion VARCHAR2(200) NOT NULL
);

-- Tabla Perfiles de riesgo
CREATE TABLE Perfiles_Riesgo (
    Codigo VARCHAR2(20) PRIMARY KEY,
    Descripcion VARCHAR2(200) NOT NULL
);

-- Tabla Usuarios
CREATE TABLE Usuarios (
    Email VARCHAR2(200) PRIMARY KEY,
    NombreCompleto VARCHAR2(200) NOT NULL,
    Contrasena VARCHAR2(255) NOT NULL,
    Telefono VARCHAR2(20),
    PerfilRiesgoCodigo VARCHAR2(20),
    DivisaBaseCodigo VARCHAR2(3),
    IdiomaCodigo VARCHAR2(3),
    FormatoFecha VARCHAR2(20),
    FechaDeCreacion DATE,
    UltimoAcceso DATE,

    CONSTRAINT FK_Usuarios_PerfilesRiesgo
        FOREIGN KEY (PerfilRiesgoCodigo)
        REFERENCES Perfiles_Riesgo(Codigo)
        ON DELETE SET NULL,

    CONSTRAINT FK_Usuarios_Divisas
        FOREIGN KEY (DivisaBaseCodigo)
        REFERENCES Divisas(Codigo)
        ON DELETE SET NULL,

    CONSTRAINT FK_Usuarios_Idiomas
        FOREIGN KEY (IdiomaCodigo)
        REFERENCES Idiomas(Codigo)
        ON DELETE SET NULL
);

-- Tabla TiposCuentas
CREATE TABLE TiposCuentas (
    Codigo VARCHAR2(20) PRIMARY KEY,
    Descripcion VARCHAR2(200) NOT NULL
);

-- Tabla Cuentas
CREATE TABLE Cuentas (
    EmailUsuario VARCHAR2(200),
    TipoCuentaCodigo VARCHAR2(20),
    NumeroCuenta NUMBER,
    FechaEnlace DATE,
    Activa NUMBER(1),

    CONSTRAINT PK_Cuentas
        PRIMARY KEY (EmailUsuario, TipoCuentaCodigo, NumeroCuenta),

    CONSTRAINT FK_Cuentas_Usuarios
        FOREIGN KEY (EmailUsuario)
        REFERENCES Usuarios(Email)
        ON DELETE CASCADE,

    CONSTRAINT FK_Cuentas_TiposCuentas
        FOREIGN KEY (TipoCuentaCodigo)
        REFERENCES TiposCuentas(Codigo)
        ON DELETE CASCADE,

    CONSTRAINT CHK_Cuentas_Activa
        CHECK (Activa IN (0,1))
);

-- Tabla Cambios
CREATE TABLE Cambios (
    DivisaOrigen VARCHAR2(3),
    DivisaDestino VARCHAR2(3),
    FecIni DATE,
    FecFin DATE,
    Cambio NUMBER,

    CONSTRAINT PK_Cambios
        PRIMARY KEY (DivisaOrigen, DivisaDestino, FecIni),

    CONSTRAINT FK_Cambios_DivisaOrigen
        FOREIGN KEY (DivisaOrigen)
        REFERENCES Divisas(Codigo),

    CONSTRAINT FK_Cambios_DivisaDestino
        FOREIGN KEY (DivisaDestino)
        REFERENCES Divisas(Codigo),

    CONSTRAINT CHK_Cambios_Fechas
        CHECK (FecFin IS NULL OR FecFin >= FecIni),

    CONSTRAINT CHK_Cambios_DivisasDistintas
        CHECK (DivisaOrigen <> DivisaDestino)
);

-- Trigger para evitar solapamientos
CREATE OR REPLACE TRIGGER TRG_Cambios_NoSolapamiento
BEFORE INSERT OR UPDATE ON Cambios
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_count
    FROM Cambios c
    WHERE c.DivisaOrigen = :NEW.DivisaOrigen
      AND c.DivisaDestino = :NEW.DivisaDestino
      AND c.FecIni <> :NEW.FecIni
      AND (
            (:NEW.FecFin IS NULL OR c.FecIni <= :NEW.FecFin)
        AND (c.FecFin IS NULL OR c.FecFin >= :NEW.FecIni)
      );

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Solapamiento de rangos en Cambios');
    END IF;
END;
/

-- Tabla TiposActivos
CREATE TABLE TiposActivos (
    Codigo VARCHAR2(20) PRIMARY KEY,
    Descripcion VARCHAR2(200),
    Logo VARCHAR2(500),
    RiesgoCodigo VARCHAR2(20) NOT NULL,

    CONSTRAINT FK_TiposActivos_Riesgo
        FOREIGN KEY (RiesgoCodigo)
        REFERENCES Perfiles_Riesgo(Codigo)
);

-- Tabla Activos
CREATE TABLE Activos (
    Codigo NUMBER PRIMARY KEY,
    Descripcion VARCHAR2(200),
    TipoCodigo VARCHAR2(20),
    DivisaCodigo VARCHAR2(3),

    CONSTRAINT FK_Activos_Tipos
        FOREIGN KEY (TipoCodigo)
        REFERENCES TiposActivos(Codigo),

    CONSTRAINT FK_Activos_Divisa
        FOREIGN KEY (DivisaCodigo)
        REFERENCES Divisas(Codigo)
);

-- Tabla Valor Historico de Activo
CREATE TABLE ValorHistoricoActivo (
    ActivoCodigo NUMBER,
    Fecha DATE,
    Valor NUMBER,

    CONSTRAINT PK_ValorHistorico
        PRIMARY KEY (ActivoCodigo, Fecha),

    CONSTRAINT FK_ValorHistorico_Activo
        FOREIGN KEY (ActivoCodigo)
        REFERENCES Activos(Codigo)
        ON DELETE CASCADE
);

-- Tabla Activos Poseidos
CREATE TABLE ActivosPoseidos (
    EmailUsuario VARCHAR2(200),
    ActivoCodigo NUMBER,
    Cantidad NUMBER,
    FechaInicio DATE,

    CONSTRAINT PK_ActivosPoseidos
        PRIMARY KEY (EmailUsuario, ActivoCodigo),

    CONSTRAINT FK_AP_Usuario
        FOREIGN KEY (EmailUsuario)
        REFERENCES Usuarios(Email)
        ON DELETE CASCADE,

    CONSTRAINT FK_AP_Activo
        FOREIGN KEY (ActivoCodigo)
        REFERENCES Activos(Codigo)
        ON DELETE CASCADE
);