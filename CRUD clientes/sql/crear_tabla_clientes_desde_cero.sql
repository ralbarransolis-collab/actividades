-- Usa este script solamente si no necesitas conservar la tabla clientes anterior.

DROP TABLE IF EXISTS clientes;

CREATE TABLE clientes (
    rut VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad INTEGER NOT NULL CHECK (edad >= 0)
);

INSERT INTO clientes (rut, nombre, edad)
VALUES
    ('11111111-1', 'Ana Torres', 28),
    ('22222222-2', 'Carlos Muñoz', 35),
    ('33333333-3', 'Daniela Rojas', 24);
