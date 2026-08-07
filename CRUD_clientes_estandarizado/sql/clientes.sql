CREATE TABLE IF NOT EXISTS clientes (
    rut VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad INTEGER NOT NULL CHECK (edad BETWEEN 0 AND 120)
);

INSERT INTO clientes (rut, nombre, edad)
VALUES
    ('17654321-3', 'Camila Herrera', 27),
    ('18987654-8', 'Diego Salazar', 34),
    ('20345678-6', 'Fernanda Morales', 22),
    ('21456789-K', 'Joaquín Fuentes', 41),
    ('16543210-K', 'Viviana Rojas', 30);
