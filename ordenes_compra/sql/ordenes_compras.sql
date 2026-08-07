CREATE TABLE clientes (
    rut VARCHAR(12) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150)
);

CREATE TABLE direcciones (
    id_direccion SERIAL PRIMARY KEY,
    rut_cliente VARCHAR(12) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    comuna VARCHAR(100) NOT NULL,
    FOREIGN KEY (rut_cliente)
        REFERENCES clientes(rut)
        ON DELETE CASCADE
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(12, 0) NOT NULL,
    existencias INTEGER NOT NULL DEFAULT 0,
    CHECK (precio >= 0),
    CHECK (existencias >= 0)
);

CREATE TABLE orden (
    id_orden SERIAL PRIMARY KEY,
    rut_cliente VARCHAR(12) NOT NULL,
    fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rut_cliente)
        REFERENCES clientes(rut)
);

CREATE TABLE despachos (
    id_despacho SERIAL PRIMARY KEY,
    id_orden INTEGER NOT NULL UNIQUE,
    id_direccion INTEGER NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (id_orden)
        REFERENCES orden(id_orden)
        ON DELETE CASCADE,
    FOREIGN KEY (id_direccion)
        REFERENCES direcciones(id_direccion)
);

CREATE TABLE lista_productos (
    id_lista SERIAL PRIMARY KEY,
    id_orden INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad_producto INTEGER NOT NULL,
    FOREIGN KEY (id_orden)
        REFERENCES orden(id_orden)
        ON DELETE CASCADE,
    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto),
    CHECK (cantidad_producto > 0)
);


INSERT INTO clientes (
    rut,
    nombre,
    correo
)
VALUES
(
    '11111111-1',
    'Juan Pérez',
    'juan@email.cl'
),
(
    '22222222-2',
    'María González',
    'maria@email.cl'
),
(
    '33333333-3',
    'Pedro Soto',
    'pedro@email.cl'
);

INSERT INTO direcciones (
    rut_cliente,
    direccion,
    comuna
)
VALUES
(
    '11111111-1',
    'Los Carrera 123',
    'Concepción'
),
(
    '11111111-1',
    'O Higgins 456',
    'Chiguayante'
),
(
    '22222222-2',
    'Los Robles 789',
    'San Pedro de la Paz'
),
(
    '33333333-3',
    'Avenida Alemania 250',
    'Temuco'
);



INSERT INTO productos (
    nombre,
    precio,
    existencias
)
VALUES
(
    'Taladro eléctrico',
    49990,
    10
),
(
    'Martillo carpintero',
    8990,
    25
),
(
    'Sierra circular',
    69990,
    5
),
(
    'Caja de tornillos',
    5990,
    50
),
(
    'Esmeril angular',
    39990,
    2
),
(
    'Atornillador inalámbrico',
    54990,
    8
);