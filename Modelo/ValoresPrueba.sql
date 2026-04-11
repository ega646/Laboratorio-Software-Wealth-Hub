-- =========================
-- INSERTAR IDIOMAS
-- =========================
INSERT INTO Idiomas VALUES ('ES', 'Español');
INSERT INTO Idiomas VALUES ('EN', 'Inglés');
INSERT INTO Idiomas VALUES ('FR', 'Francés');

-- =========================
-- INSERTAR DIVISAS
-- =========================
INSERT INTO Divisas VALUES ('EUR', 'Euro');
INSERT INTO Divisas VALUES ('USD', 'Dólar estadounidense');
INSERT INTO Divisas VALUES ('GBP', 'Libra esterlina');

-- =========================
-- INSERTAR PERFILES DE RIESGO
-- =========================
INSERT INTO Perfiles_Riesgo VALUES ('BAJO', 'Riesgo bajo');
INSERT INTO Perfiles_Riesgo VALUES ('MEDIO', 'Riesgo medio');
INSERT INTO Perfiles_Riesgo VALUES ('ALTO', 'Riesgo alto');

-- =========================
-- INSERTAR USUARIOS
-- =========================
INSERT INTO Usuarios VALUES (
    'juan@example.com',
    'Juan Pérez',
    'pass123',
    '600123123',
    'MEDIO',
    'EUR',
    'ES',
    'DD/MM/YYYY',
    SYSDATE,
    SYSDATE
);

INSERT INTO Usuarios VALUES (
    'ana@example.com',
    'Ana Gómez',
    'pass456',
    '600456456',
    'ALTO',
    'USD',
    'EN',
    'MM/DD/YYYY',
    SYSDATE,
    SYSDATE
);

-- =========================
-- TIPOS DE CUENTA
-- =========================
INSERT INTO TiposCuentas VALUES ('CORRIENTE', 'Cuenta corriente');
INSERT INTO TiposCuentas VALUES ('AHORRO', 'Cuenta de ahorro');
INSERT INTO TiposCuentas VALUES ('INVERSIÓN', 'Cuenta de inversión');

-- =========================
-- CUENTAS
-- =========================
INSERT INTO Cuentas VALUES (
    'juan@example.com', 'CORRIENTE', 1, SYSDATE, 1
);

INSERT INTO Cuentas VALUES (
    'juan@example.com', 'AHORRO', 2, SYSDATE, 1
);

INSERT INTO Cuentas VALUES (
    'ana@example.com', 'INVERSIÓN', 1, SYSDATE, 1
);

-- =========================
-- CAMBIOS
-- =========================
INSERT INTO Cambios VALUES ('EUR', 'USD', TRUNC(SYSDATE), NULL, 1.10);
INSERT INTO Cambios VALUES ('USD', 'EUR', TRUNC(SYSDATE), NULL, 0.91);
INSERT INTO Cambios VALUES ('EUR', 'GBP', TRUNC(SYSDATE), NULL, 0.85);
INSERT INTO Cambios VALUES ('EUR', 'USD', TRUNC(SYSDATE)-1, NULL, 1.11);
INSERT INTO Cambios VALUES ('USD', 'EUR', TRUNC(SYSDATE)-1, NULL, 0.92);
INSERT INTO Cambios VALUES ('EUR', 'GBP', TRUNC(SYSDATE)-1, NULL, 0.86);
INSERT INTO Cambios VALUES ('EUR', 'USD', TRUNC(SYSDATE)-2, NULL, 1.12);
INSERT INTO Cambios VALUES ('USD', 'EUR', TRUNC(SYSDATE)-2, NULL, 0.93);
INSERT INTO Cambios VALUES ('EUR', 'GBP', TRUNC(SYSDATE)-2, NULL, 0.87);
INSERT INTO Cambios VALUES ('EUR', 'USD', TRUNC(SYSDATE)-3, NULL, 1.13);
INSERT INTO Cambios VALUES ('USD', 'EUR', TRUNC(SYSDATE)-3, NULL, 0.94);
INSERT INTO Cambios VALUES ('EUR', 'GBP', TRUNC(SYSDATE)-3, NULL, 0.88);
INSERT INTO Cambios VALUES ('EUR', 'USD', TRUNC(SYSDATE)-4, NULL, 1.14);
INSERT INTO Cambios VALUES ('USD', 'EUR', TRUNC(SYSDATE)-4, NULL, 0.95);
INSERT INTO Cambios VALUES ('EUR', 'GBP', TRUNC(SYSDATE)-4, NULL, 0.89);
INSERT INTO Cambios VALUES ('EUR', 'USD', TRUNC(SYSDATE)-5, NULL, 1.15);
INSERT INTO Cambios VALUES ('USD', 'EUR', TRUNC(SYSDATE)-5, NULL, 0.96);
INSERT INTO Cambios VALUES ('EUR', 'GBP', TRUNC(SYSDATE)-5, NULL, 0.90);
INSERT INTO Cambios VALUES ('EUR', 'USD', TRUNC(SYSDATE)-6, NULL, 1.16);
INSERT INTO Cambios VALUES ('USD', 'EUR', TRUNC(SYSDATE)-6, NULL, 0.97);
INSERT INTO Cambios VALUES ('EUR', 'GBP', TRUNC(SYSDATE)-6, NULL, 0.91);

-- =========================
-- TIPOS DE ACTIVOS
-- =========================
INSERT INTO TiposActivos VALUES ('CRYPTO', 'Criptomonedas', NULL, 'ALTO');
INSERT INTO TiposActivos VALUES ('INVERSION', 'Inversiones tradicionales', NULL, 'MEDIO');
INSERT INTO TiposActivos VALUES ('PROPIEDAD', 'Propiedades inmobiliarias', NULL, 'BAJO');

-- =========================
-- USUARIOS
-- =========================
INSERT INTO Usuarios VALUES ('jose@example.com','Jose Ruiz','123','600000001','MEDIO','EUR','ES','DD/MM/YYYY',SYSDATE,SYSDATE);
INSERT INTO Usuarios VALUES ('joaquin@example.com','Joaquin López','123','600000002','ALTO','USD','ES','DD/MM/YYYY',SYSDATE,SYSDATE);
INSERT INTO Usuarios VALUES ('marc@example.com','Marc Vidal','123','600000003','BAJO','EUR','EN','DD/MM/YYYY',SYSDATE,SYSDATE);
INSERT INTO Usuarios VALUES ('enrique@example.com','Enrique Soto','123','600000004','MEDIO','GBP','ES','DD/MM/YYYY',SYSDATE,SYSDATE);
INSERT INTO Usuarios VALUES ('bizarro@example.com','Bizarro User','123','600000005','ALTO','USD','EN','DD/MM/YYYY',SYSDATE,SYSDATE);

-- =========================
-- ACTIVOS
-- =========================
INSERT INTO Activos VALUES (10, 'CRYPTO', 'USD');     -- BTC tipo
INSERT INTO Activos VALUES (11, 'CRYPTO', 'USD');     -- ETH tipo
INSERT INTO Activos VALUES (20, 'INVERSION', 'EUR');  -- Fondo
INSERT INTO Activos VALUES (21, 'INVERSION', 'USD');  -- ETF
INSERT INTO Activos VALUES (30, 'PROPIEDAD', 'EUR');  -- Vivienda
INSERT INTO Activos VALUES (31, 'PROPIEDAD', 'GBP');  -- Local

-- =========================
-- ACTIVOS POSEIDOS
-- =========================
INSERT INTO ActivosPoseidos VALUES ('jose@example.com', 10, 0.5, SYSDATE-10);
INSERT INTO ActivosPoseidos VALUES ('jose@example.com', 20, 100, SYSDATE-20);

INSERT INTO ActivosPoseidos VALUES ('joaquin@example.com', 11, 2, SYSDATE-5);
INSERT INTO ActivosPoseidos VALUES ('joaquin@example.com', 21, 50, SYSDATE-15);

INSERT INTO ActivosPoseidos VALUES ('marc@example.com', 30, 1, SYSDATE-100);

INSERT INTO ActivosPoseidos VALUES ('enrique@example.com', 20, 200, SYSDATE-30);
INSERT INTO ActivosPoseidos VALUES ('enrique@example.com', 31, 1, SYSDATE-200);

INSERT INTO ActivosPoseidos VALUES ('bizarro@example.com', 10, 5, SYSDATE-2);
INSERT INTO ActivosPoseidos VALUES ('bizarro@example.com', 11, 10, SYSDATE-1);

-- =========================
-- VALORES HISTÓRICOS
-- =========================

INSERT INTO ValorHistoricoActivo VALUES (10, TRUNC(SYSDATE)-6, 30000);
INSERT INTO ValorHistoricoActivo VALUES (10, TRUNC(SYSDATE)-5, 30500);
INSERT INTO ValorHistoricoActivo VALUES (10, TRUNC(SYSDATE)-4, 31000);
INSERT INTO ValorHistoricoActivo VALUES (10, TRUNC(SYSDATE)-3, 29500);
INSERT INTO ValorHistoricoActivo VALUES (10, TRUNC(SYSDATE)-2, 32000);
INSERT INTO ValorHistoricoActivo VALUES (10, TRUNC(SYSDATE)-1, 33000);
INSERT INTO ValorHistoricoActivo VALUES (10, TRUNC(SYSDATE),   32500);
INSERT INTO ValorHistoricoActivo VALUES (11, TRUNC(SYSDATE)-6, 2000);
INSERT INTO ValorHistoricoActivo VALUES (11, TRUNC(SYSDATE)-5, 2100);
INSERT INTO ValorHistoricoActivo VALUES (11, TRUNC(SYSDATE)-4, 2050);
INSERT INTO ValorHistoricoActivo VALUES (11, TRUNC(SYSDATE)-3, 2200);
INSERT INTO ValorHistoricoActivo VALUES (11, TRUNC(SYSDATE)-2, 2300);
INSERT INTO ValorHistoricoActivo VALUES (11, TRUNC(SYSDATE)-1, 2400);
INSERT INTO ValorHistoricoActivo VALUES (11, TRUNC(SYSDATE),   2350);
INSERT INTO ValorHistoricoActivo VALUES (20, TRUNC(SYSDATE)-6, 100);
INSERT INTO ValorHistoricoActivo VALUES (20, TRUNC(SYSDATE)-5, 102);
INSERT INTO ValorHistoricoActivo VALUES (20, TRUNC(SYSDATE)-4, 101);
INSERT INTO ValorHistoricoActivo VALUES (20, TRUNC(SYSDATE)-3, 103);
INSERT INTO ValorHistoricoActivo VALUES (20, TRUNC(SYSDATE)-2, 104);
INSERT INTO ValorHistoricoActivo VALUES (20, TRUNC(SYSDATE)-1, 105);
INSERT INTO ValorHistoricoActivo VALUES (20, TRUNC(SYSDATE),   106);
INSERT INTO ValorHistoricoActivo VALUES (21, TRUNC(SYSDATE)-6, 50);
INSERT INTO ValorHistoricoActivo VALUES (21, TRUNC(SYSDATE)-5, 51);
INSERT INTO ValorHistoricoActivo VALUES (21, TRUNC(SYSDATE)-4, 52);
INSERT INTO ValorHistoricoActivo VALUES (21, TRUNC(SYSDATE)-3, 53);
INSERT INTO ValorHistoricoActivo VALUES (21, TRUNC(SYSDATE)-2, 52);
INSERT INTO ValorHistoricoActivo VALUES (21, TRUNC(SYSDATE)-1, 54);
INSERT INTO ValorHistoricoActivo VALUES (21, TRUNC(SYSDATE),   55);
INSERT INTO ValorHistoricoActivo VALUES (30, TRUNC(SYSDATE)-6, 200000);
INSERT INTO ValorHistoricoActivo VALUES (30, TRUNC(SYSDATE)-5, 200500);
INSERT INTO ValorHistoricoActivo VALUES (30, TRUNC(SYSDATE)-4, 201000);
INSERT INTO ValorHistoricoActivo VALUES (30, TRUNC(SYSDATE)-3, 202000);
INSERT INTO ValorHistoricoActivo VALUES (30, TRUNC(SYSDATE)-2, 202500);
INSERT INTO ValorHistoricoActivo VALUES (30, TRUNC(SYSDATE)-1, 203000);
INSERT INTO ValorHistoricoActivo VALUES (30, TRUNC(SYSDATE),   203500);
INSERT INTO ValorHistoricoActivo VALUES (31, TRUNC(SYSDATE)-6, 150000);
INSERT INTO ValorHistoricoActivo VALUES (31, TRUNC(SYSDATE)-5, 150200);
INSERT INTO ValorHistoricoActivo VALUES (31, TRUNC(SYSDATE)-4, 150500);
INSERT INTO ValorHistoricoActivo VALUES (31, TRUNC(SYSDATE)-3, 151000);
INSERT INTO ValorHistoricoActivo VALUES (31, TRUNC(SYSDATE)-2, 151200);
INSERT INTO ValorHistoricoActivo VALUES (31, TRUNC(SYSDATE)-1, 151500);
INSERT INTO ValorHistoricoActivo VALUES (31, TRUNC(SYSDATE),   152000);

-- =========================
-- COMMIT FINAL
-- =========================
COMMIT;