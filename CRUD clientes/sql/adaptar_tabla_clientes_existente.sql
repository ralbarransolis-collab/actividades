-- Este script adapta la tabla clientes creada en la actividad anterior.
-- Conserva las columnas existentes y agrega rut y edad.

ALTER TABLE clientes
    ADD COLUMN IF NOT EXISTS rut VARCHAR(20),
    ADD COLUMN IF NOT EXISTS edad INTEGER;

-- La actividad anterior pudo haber definido correo como NOT NULL.
-- Se permite NULL para que el nuevo POST solo requiera rut, nombre y edad.
ALTER TABLE clientes
    ALTER COLUMN correo DROP NOT NULL;

-- Asigna valores temporales a filas antiguas que todavía no tengan RUT o edad.
-- Después puedes reemplazarlos por datos reales.
UPDATE clientes
SET rut = 'TEMP-' || id
WHERE rut IS NULL;

UPDATE clientes
SET edad = 18
WHERE edad IS NULL;

ALTER TABLE clientes
    ALTER COLUMN rut SET NOT NULL,
    ALTER COLUMN edad SET NOT NULL;

-- Evita RUT duplicados.
CREATE UNIQUE INDEX IF NOT EXISTS clientes_rut_unico
    ON clientes (rut);

ALTER TABLE clientes
    DROP CONSTRAINT IF EXISTS clientes_edad_valida;

ALTER TABLE clientes
    ADD CONSTRAINT clientes_edad_valida
    CHECK (edad >= 0);

-- Datos nuevos para probar el CRUD.
INSERT INTO clientes (rut, nombre, edad)
VALUES
    ('11111111-1', 'Ana Torres', 28),
    ('22222222-2', 'Carlos Muñoz', 35),
    ('33333333-3', 'Daniela Rojas', 24)
ON CONFLICT (rut) DO NOTHING;

SELECT rut, nombre, edad
FROM clientes
ORDER BY nombre;
