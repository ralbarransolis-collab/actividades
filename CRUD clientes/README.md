# Actividad: CRUD de clientes con Node.js y PostgreSQL

Aplicación desarrollada con Node.js, Express, EJS, `pg`, PostgreSQL y Bootstrap. Implementa consultas parametrizadas para crear, consultar, modificar y eliminar clientes.

## Requisitos

- Node.js
- PostgreSQL
- Una base de datos existente
- Tabla `clientes` adaptada al nuevo ejercicio

## Estructura

```text
actividad-crud-clientes-pg/
├── app.js
├── package.json
├── .env.example
├── config/
│   └── db.js
├── sql/
│   ├── adaptar_tabla_clientes_existente.sql
│   └── crear_tabla_clientes_desde_cero.sql
├── views/
│   ├── index.ejs
│   ├── error.ejs
│   └── partials/
├── public/
│   ├── css/style.css
│   └── js/app.js
└── capturas/
    └── README.md
```

## Adaptar la tabla creada en la actividad anterior

La tabla anterior tenía columnas como `id`, `correo`, `telefono` y `ciudad`. Esta actividad requiere `rut`, `nombre` y `edad`.

Para conservar la tabla y sus registros, ejecuta en pgAdmin:

```text
sql/adaptar_tabla_clientes_existente.sql
```

El script:

- Agrega `rut` y `edad`.
- Permite que `correo` quede vacío para los nuevos registros.
- Asigna valores temporales a filas antiguas.
- Crea una restricción única para `rut`.
- Agrega datos de prueba.

Si no necesitas conservar la tabla anterior, puedes usar:

```text
sql/crear_tabla_clientes_desde_cero.sql
```

## Configuración

Copia `.env.example` como `.env` y completa la cadena de conexión:

```env
PORT=3000
DATABASE_URL=postgres://postgres:TU_CLAVE@localhost:5432/TU_BASE_DE_DATOS
```

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

Abre:

```text
http://localhost:3000
```

## Endpoints REST

### Listar clientes

```http
GET /clientes
```

Respuesta: `200 OK` con un arreglo JSON ordenado por nombre.

### Crear cliente

```http
POST /clientes
Content-Type: application/json
```

```json
{
  "rut": "44444444-4",
  "nombre": "Felipe Soto",
  "edad": 31
}
```

Posibles códigos: `201`, `400`, `409`, `500`.

### Modificar únicamente el nombre

```http
PUT /clientes/44444444-4
Content-Type: application/json
```

```json
{
  "nombre": "Felipe Andrés Soto"
}
```

Posibles códigos: `200`, `400`, `404`, `500`.

### Eliminar cliente

```http
DELETE /clientes/44444444-4
```

Posibles códigos: `200`, `400`, `404`, `500`.

## Consultas parametrizadas

Los valores ingresados por el usuario se envían por separado del texto SQL:

```javascript
const resultado = await pool.query(
    "DELETE FROM clientes WHERE rut = $1 RETURNING rut, nombre, edad",
    [rut]
);
```

## Frontend

La página principal contiene cuatro formularios separados:

- Crear cliente.
- Consultar clientes.
- Modificar nombre.
- Eliminar cliente.

El frontend consume los endpoints mediante `fetch()` y muestra los mensajes de error enviados por el servidor.
