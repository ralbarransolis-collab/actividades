CREATE TABLE IF NOT EXISTS clientes_difer (
    id_cliente SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE
);


INSERT INTO clientes_difer (
    nombre_cliente,
    correo
)
VALUES
(
    'Camila Rojas',
    'camila.rojas@email.cl'
),
(
    'Felipe Contreras',
    'felipe.contreras@email.cl'
),
(
    'Daniela Muñoz',
    'daniela.munoz@email.cl'
)
ON CONFLICT (correo) DO NOTHING;
