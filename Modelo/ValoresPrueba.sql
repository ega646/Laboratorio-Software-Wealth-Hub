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
    NOW(),
    NOW()
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
    NOW(),
    NOW()
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
    'juan@example.com', 'CORRIENTE', 1, NOW(), TRUE
);

INSERT INTO Cuentas VALUES (
    'juan@example.com', 'AHORRO', 2, NOW(), TRUE
);

INSERT INTO Cuentas VALUES (
    'ana@example.com', 'INVERSIÓN', 1, NOW(), TRUE
);

-- =========================
-- CAMBIOS
-- =========================
INSERT INTO Cambios VALUES ('EUR', 'USD', date_trunc('day', now()), date_trunc('day', now()), 1.10);
INSERT INTO Cambios VALUES ('USD', 'EUR', date_trunc('day', now()), date_trunc('day', now()), 0.91);
INSERT INTO Cambios VALUES ('EUR', 'GBP', date_trunc('day', now()), date_trunc('day', now()), 0.85);
INSERT INTO Cambios VALUES ('EUR', 'USD', date_trunc('day', now())-(1 * interval '1 day'), date_trunc('day', now())-(1 * interval '1 day'), 1.11);
INSERT INTO Cambios VALUES ('USD', 'EUR', date_trunc('day', now())-(1 * interval '1 day'), date_trunc('day', now())-(1 * interval '1 day'), 0.92);
INSERT INTO Cambios VALUES ('EUR', 'GBP', date_trunc('day', now())-(1 * interval '1 day'), date_trunc('day', now())-(1 * interval '1 day'), 0.86);
INSERT INTO Cambios VALUES ('EUR', 'USD', date_trunc('day', now())-(2 * interval '1 day'), date_trunc('day', now())-(2 * interval '1 day'), 1.12);
INSERT INTO Cambios VALUES ('USD', 'EUR', date_trunc('day', now())-(2 * interval '1 day'), date_trunc('day', now())-(2 * interval '1 day'), 0.93);
INSERT INTO Cambios VALUES ('EUR', 'GBP', date_trunc('day', now())-(2 * interval '1 day'), date_trunc('day', now())-(2 * interval '1 day'), 0.87);
INSERT INTO Cambios VALUES ('EUR', 'USD', date_trunc('day', now())-(3 * interval '1 day'), date_trunc('day', now())-(3 * interval '1 day'), 1.13);
INSERT INTO Cambios VALUES ('USD', 'EUR', date_trunc('day', now())-(3 * interval '1 day'), date_trunc('day', now())-(3 * interval '1 day'), 0.94);
INSERT INTO Cambios VALUES ('EUR', 'GBP', date_trunc('day', now())-(3 * interval '1 day'), date_trunc('day', now())-(3 * interval '1 day'), 0.88);
INSERT INTO Cambios VALUES ('EUR', 'USD', date_trunc('day', now())-(4 * interval '1 day'), date_trunc('day', now())-(4 * interval '1 day'), 1.14);
INSERT INTO Cambios VALUES ('USD', 'EUR', date_trunc('day', now())-(4 * interval '1 day'), date_trunc('day', now())-(4 * interval '1 day'), 0.95);
INSERT INTO Cambios VALUES ('EUR', 'GBP', date_trunc('day', now())-(4 * interval '1 day'), date_trunc('day', now())-(4 * interval '1 day'), 0.89);
INSERT INTO Cambios VALUES ('EUR', 'USD', date_trunc('day', now())-(5 * interval '1 day'), date_trunc('day', now())-(5 * interval '1 day'), 1.15);
INSERT INTO Cambios VALUES ('USD', 'EUR', date_trunc('day', now())-(5 * interval '1 day'), date_trunc('day', now())-(5 * interval '1 day'), 0.96);
INSERT INTO Cambios VALUES ('EUR', 'GBP', date_trunc('day', now())-(5 * interval '1 day'), date_trunc('day', now())-(5 * interval '1 day'), 0.90);
INSERT INTO Cambios VALUES ('EUR', 'USD', date_trunc('day', now())-(6 * interval '1 day'), date_trunc('day', now())-(6 * interval '1 day'), 1.16);
INSERT INTO Cambios VALUES ('USD', 'EUR', date_trunc('day', now())-(6 * interval '1 day'), date_trunc('day', now())-(6 * interval '1 day'), 0.97);
INSERT INTO Cambios VALUES ('EUR', 'GBP', date_trunc('day', now())-(6 * interval '1 day'), date_trunc('day', now())-(6 * interval '1 day'), 0.91);

-- =========================
-- TIPOS DE ACTIVOS
-- =========================
INSERT INTO TiposActivos VALUES ('CRYPTO', 'Criptomonedas', NULL, 'ALTO');
INSERT INTO TiposActivos VALUES ('INVERSION', 'Inversiones tradicionales', NULL, 'MEDIO');
INSERT INTO TiposActivos VALUES ('PROPIEDAD', 'Propiedades inmobiliarias', NULL, 'BAJO');

-- =========================
-- USUARIOS
-- =========================
INSERT INTO Usuarios VALUES ('jose@example.com','Jose Ruiz','123','600000001','MEDIO','EUR','ES','DD/MM/YYYY',NOW(),NOW());
INSERT INTO Usuarios VALUES ('joaquin@example.com','Joaquin López','123','600000002','ALTO','USD','ES','DD/MM/YYYY',NOW(),NOW());
INSERT INTO Usuarios VALUES ('marc@example.com','Marc Vidal','123','600000003','BAJO','EUR','EN','DD/MM/YYYY',NOW(),NOW());
INSERT INTO Usuarios VALUES ('enrique@example.com','Enrique Soto','123','600000004','MEDIO','GBP','ES','DD/MM/YYYY',NOW(),NOW());
INSERT INTO Usuarios VALUES ('bizarro@example.com','Bizarro User','123','600000005','ALTO','USD','EN','DD/MM/YYYY',NOW(),NOW());

-- =========================
-- ACTIVOS
-- =========================
INSERT INTO Activos VALUES (10, 'Bitcoin', 'CRYPTO', 'USD');
INSERT INTO Activos VALUES (11, 'Ethereum', 'CRYPTO', 'USD');
INSERT INTO Activos VALUES (20, 'Fondo Indexado Global', 'INVERSION', 'EUR');
INSERT INTO Activos VALUES (21, 'ETF S&P 500', 'INVERSION', 'USD');
INSERT INTO Activos VALUES (30, 'Vivienda en Madrid', 'PROPIEDAD', 'EUR');
INSERT INTO Activos VALUES (31, 'Local en Londres', 'PROPIEDAD', 'GBP');

-- =========================
-- ACTIVOS POSEIDOS
-- =========================
INSERT INTO ActivosPoseidos VALUES ('jose@example.com', 10, 0.5, date_trunc('day', now())-(10 * interval '1 day'));
INSERT INTO ActivosPoseidos VALUES ('jose@example.com', 20, 100, date_trunc('day', now())-(10 * interval '1 day'));

INSERT INTO ActivosPoseidos VALUES ('joaquin@example.com', 11, 2, date_trunc('day', now())-(10 * interval '1 day'));
INSERT INTO ActivosPoseidos VALUES ('joaquin@example.com', 21, 50, date_trunc('day', now())-(10 * interval '1 day'));

INSERT INTO ActivosPoseidos VALUES ('marc@example.com', 30, 1, date_trunc('day', now())-(10 * interval '1 day'));

INSERT INTO ActivosPoseidos VALUES ('enrique@example.com', 20, 200, date_trunc('day', now())-(10 * interval '1 day'));
INSERT INTO ActivosPoseidos VALUES ('enrique@example.com', 31, 1, date_trunc('day', now())-(10 * interval '1 day'));

INSERT INTO ActivosPoseidos VALUES ('bizarro@example.com', 10, 5, date_trunc('day', now())-(10 * interval '1 day'));
INSERT INTO ActivosPoseidos VALUES ('bizarro@example.com', 11, 10, date_trunc('day', now())-(10 * interval '1 day'));

-- =========================
-- VALORES HISTÓRICOS
-- =========================

INSERT INTO ValorHistoricoActivo VALUES (10, date_trunc('day', now())-(6 * interval '1 day'), 30000);
INSERT INTO ValorHistoricoActivo VALUES (10, date_trunc('day', now())-(5 * interval '1 day'), 30500);
INSERT INTO ValorHistoricoActivo VALUES (10, date_trunc('day', now())-(4 * interval '1 day'), 31000);
INSERT INTO ValorHistoricoActivo VALUES (10, date_trunc('day', now())-(3 * interval '1 day'), 29500);
INSERT INTO ValorHistoricoActivo VALUES (10, date_trunc('day', now())-(2 * interval '1 day'), 32000);
INSERT INTO ValorHistoricoActivo VALUES (10, date_trunc('day', now())-(1 * interval '1 day'), 33000);
INSERT INTO ValorHistoricoActivo VALUES (10, date_trunc('day', now()),   32500);
INSERT INTO ValorHistoricoActivo VALUES (11, date_trunc('day', now())-(6 * interval '1 day'), 2000);
INSERT INTO ValorHistoricoActivo VALUES (11, date_trunc('day', now())-(5 * interval '1 day'), 2100);
INSERT INTO ValorHistoricoActivo VALUES (11, date_trunc('day', now())-(4 * interval '1 day'), 2050);
INSERT INTO ValorHistoricoActivo VALUES (11, date_trunc('day', now())-(3 * interval '1 day'), 2200);
INSERT INTO ValorHistoricoActivo VALUES (11, date_trunc('day', now())-(2 * interval '1 day'), 2300);
INSERT INTO ValorHistoricoActivo VALUES (11, date_trunc('day', now())-(1 * interval '1 day'), 2400);
INSERT INTO ValorHistoricoActivo VALUES (11, date_trunc('day', now()),   2350);
INSERT INTO ValorHistoricoActivo VALUES (20, date_trunc('day', now())-(6 * interval '1 day'), 100);
INSERT INTO ValorHistoricoActivo VALUES (20, date_trunc('day', now())-(5 * interval '1 day'), 102);
INSERT INTO ValorHistoricoActivo VALUES (20, date_trunc('day', now())-(4 * interval '1 day'), 101);
INSERT INTO ValorHistoricoActivo VALUES (20, date_trunc('day', now())-(3 * interval '1 day'), 103);
INSERT INTO ValorHistoricoActivo VALUES (20, date_trunc('day', now())-(2 * interval '1 day'), 104);
INSERT INTO ValorHistoricoActivo VALUES (20, date_trunc('day', now())-(1 * interval '1 day'), 105);
INSERT INTO ValorHistoricoActivo VALUES (20, date_trunc('day', now()),   106);
INSERT INTO ValorHistoricoActivo VALUES (21, date_trunc('day', now())-(6 * interval '1 day'), 50);
INSERT INTO ValorHistoricoActivo VALUES (21, date_trunc('day', now())-(5 * interval '1 day'), 51);
INSERT INTO ValorHistoricoActivo VALUES (21, date_trunc('day', now())-(4 * interval '1 day'), 52);
INSERT INTO ValorHistoricoActivo VALUES (21, date_trunc('day', now())-(3 * interval '1 day'), 53);
INSERT INTO ValorHistoricoActivo VALUES (21, date_trunc('day', now())-(2 * interval '1 day'), 52);
INSERT INTO ValorHistoricoActivo VALUES (21, date_trunc('day', now())-(1 * interval '1 day'), 54);
INSERT INTO ValorHistoricoActivo VALUES (21, date_trunc('day', now()),   55);
INSERT INTO ValorHistoricoActivo VALUES (30, date_trunc('day', now())-(6 * interval '1 day'), 200000);
INSERT INTO ValorHistoricoActivo VALUES (30, date_trunc('day', now())-(5 * interval '1 day'), 200500);
INSERT INTO ValorHistoricoActivo VALUES (30, date_trunc('day', now())-(4 * interval '1 day'), 201000);
INSERT INTO ValorHistoricoActivo VALUES (30, date_trunc('day', now())-(3 * interval '1 day'), 202000);
INSERT INTO ValorHistoricoActivo VALUES (30, date_trunc('day', now())-(2 * interval '1 day'), 202500);
INSERT INTO ValorHistoricoActivo VALUES (30, date_trunc('day', now())-(1 * interval '1 day'), 203000);
INSERT INTO ValorHistoricoActivo VALUES (30, date_trunc('day', now()),   203500);
INSERT INTO ValorHistoricoActivo VALUES (31, date_trunc('day', now())-(6 * interval '1 day'), 150000);
INSERT INTO ValorHistoricoActivo VALUES (31, date_trunc('day', now())-(5 * interval '1 day'), 150200);
INSERT INTO ValorHistoricoActivo VALUES (31, date_trunc('day', now())-(4 * interval '1 day'), 150500);
INSERT INTO ValorHistoricoActivo VALUES (31, date_trunc('day', now())-(3 * interval '1 day'), 151000);
INSERT INTO ValorHistoricoActivo VALUES (31, date_trunc('day', now())-(2 * interval '1 day'), 151200);
INSERT INTO ValorHistoricoActivo VALUES (31, date_trunc('day', now())-(1 * interval '1 day'), 151500);
INSERT INTO ValorHistoricoActivo VALUES (31, date_trunc('day', now()),   152000);

-- =========================
-- COMMIT FINAL
-- =========================
COMMIT;