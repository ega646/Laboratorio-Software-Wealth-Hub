/* base de datos provisional para comprobar springboot */
INSERT INTO usuarios (nombre, email, password) VALUES ('Admin', 'admin@wealthhub.com', '1234');
INSERT INTO activos (nombre, ticker, tipo, cantidad, precio_compra, precio_actual, usuario_id) VALUES ('Bitcoin', 'BTC', 'Cripto', 0.5, 30000.0, 60000.0, 1);
INSERT INTO activos (nombre, ticker, tipo, cantidad, precio_compra, precio_actual, usuario_id) VALUES ('Apple', 'AAPL', 'Acción', 10.0, 150.0, 180.0, 1);