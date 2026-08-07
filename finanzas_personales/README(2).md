# Node + PostgreSQL: conexión por configuración y connection string

Aplicación desarrollada con **Node.js**, **Express**, **EJS**, **PostgreSQL**, **pg** y **dotenv**.

El proyecto utiliza dos formas de conexión mediante `Pool`:

1. Conexión por configuración de campos para consultar la tabla `finanzas_personales`.
2. Conexión mediante `connectionString` para consultar la tabla `clientes`.

Ambas conexiones pueden apuntar a la misma base de datos PostgreSQL.

---

## Tecnologías utilizadas

- Node.js
- Express
- EJS
- PostgreSQL
- pg
- dotenv
- Bootstrap 5
- Fetch API

---

## Instalación

Desde la carpeta del proyecto, ejecutar:

```bash
npm install
```

Si las dependencias no están registradas en `package.json`, instalar manualmente:

```bash
npm install express ejs pg dotenv
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_clave
DB_NAME=nombre_base_datos

DATABASE_URL=postgres://postgres:tu_clave@localhost:5432/nombre_base_datos
```

El archivo `.env` no debe subirse a GitHub.

Ejemplo de `.gitignore`:

```gitignore
node_modules/
.env
npm-debug.log*
```

---

## Estructura del proyecto

```text
proyecto/
├── app.js
├── package.json
├── .env
├── .gitignore
├── config/
│   ├── db.js
│   └── dbConnectionString.js
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── clientes.js
├── views/
│   ├── finanzas_personales.ejs
│   ├── clientes.ejs
│   └── partials/
│       ├── head.ejs
│       ├── navbar.ejs
│       └── footer.ejs
└── sql/
    └── crear_tablas.sql
```

---

## Conexión por configuración

Archivo `config/db.js`:

```javascript
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = pool;
```

Esta conexión se utiliza para consultar la tabla `finanzas_personales`.

---

## Conexión mediante connection string

Archivo `config/dbConnectionString.js`:

```javascript
const { Pool } = require("pg");

const poolConnectionString = new Pool({
    connectionString: process.env.DATABASE_URL
});

module.exports = poolConnectionString;
```

Esta conexión se utiliza para consultar la tabla `clientes`.

---

## Tablas PostgreSQL

### Tabla `finanzas_personales`

```sql
CREATE TABLE IF NOT EXISTS finanzas_personales (
    nombre VARCHAR(20) PRIMARY KEY,
    me_debe INTEGER NOT NULL DEFAULT 0,
    cuotas_cobrar INTEGER NOT NULL DEFAULT 0,
    le_debo INTEGER NOT NULL DEFAULT 0,
    cuotas_pagar INTEGER NOT NULL DEFAULT 0
);
```

Datos de ejemplo:

```sql
INSERT INTO finanzas_personales (
    nombre,
    me_debe,
    cuotas_cobrar,
    le_debo,
    cuotas_pagar
)
VALUES
    ('tía carmen', 0, 0, 5000, 1),
    ('papá', 0, 0, 15000, 3),
    ('nacho', 10000, 2, 7000, 1),
    ('almacén esquina', 0, 0, 13000, 2),
    ('vicios varios', 0, 0, 35000, 35),
    ('compañero trabajo', 50000, 5, 0, 0)
ON CONFLICT (nombre) DO NOTHING;
```

### Tabla `clientes`

```sql
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    ciudad VARCHAR(80)
);
```

Datos de ejemplo:

```sql
INSERT INTO clientes (
    nombre,
    correo,
    telefono,
    ciudad
)
VALUES
    ('Ana Torres', 'ana.torres@correo.cl', '961112233', 'Chillán'),
    ('Carlos Muñoz', 'carlos.munoz@correo.cl', '962223344', 'Concepción'),
    ('Daniela Rojas', 'daniela.rojas@correo.cl', '963334455', 'Temuco'),
    ('Felipe Soto', 'felipe.soto@correo.cl', '964445566', 'Osorno'),
    ('María González', 'maria.gonzalez@correo.cl', '965556677', 'Puerto Montt')
ON CONFLICT (correo) DO NOTHING;
```

---

## Rutas de la aplicación

### Vista de finanzas personales

```text
GET /
```

Consulta la tabla `finanzas_personales` mediante la conexión configurada por campos y renderiza la vista `finanzas_personales.ejs`.

### Vista de clientes

```text
GET /clientes
```

Renderiza la vista `clientes.ejs`.

### Endpoint JSON de clientes

```text
GET /api/clientes
```

Consulta la tabla `clientes` mediante `connectionString` y responde en formato JSON.

Ejemplo de respuesta:

```json
[
    {
        "id": 1,
        "nombre": "Ana Torres",
        "correo": "ana.torres@correo.cl",
        "telefono": "961112233",
        "ciudad": "Chillán"
    }
]
```

---

## Ejecución

Iniciar el servidor con:

```bash
npm start
```

Si no existe el script `start`, ejecutar:

```bash
node app.js
```

Abrir en el navegador:

```text
http://localhost:3000
```

Vista de clientes:

```text
http://localhost:3000/clientes
```

Endpoint JSON:

```text
http://localhost:3000/api/clientes
```

---

## Manejo de errores

Las consultas se ejecutan dentro de bloques `try/catch`.

Cuando ocurre un error en el endpoint, el servidor responde con código `500` y un mensaje JSON:

```javascript
res.status(500).json({
    mensaje: "No fue posible consultar los clientes"
});
```

En el frontend, `fetch()` captura el error y muestra un mensaje visible al usuario.

---

## Resultado esperado

- La vista principal muestra los registros de `finanzas_personales` en una tabla.
- La vista `/clientes` muestra los clientes en formato de lista.
- El endpoint `/api/clientes` responde con JSON.
- Las dos conexiones utilizan `Pool` de `pg`.
- La aplicación muestra mensajes de error cuando PostgreSQL no responde o una consulta falla.
