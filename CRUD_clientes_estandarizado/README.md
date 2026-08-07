# CRUD parametrizado de clientes

Proyecto nuevo e independiente para practicar un CRUD sobre la tabla `clientes` utilizando Node.js, Express, EJS, PostgreSQL y el paquete `pg`.

## Requisitos principales

- Todas las consultas PostgreSQL utilizan Query Objects `{ text, values }`.
- Respuestas JSON estandarizadas con la propiedad `ok`.
- Validación de RUT, nombre y edad.
- Manejo de RUT duplicado con código HTTP `409`.
- Protección contra eliminaciones masivas por nombre o edad.
- Frontend con formularios separados para crear, modificar, consultar y eliminar.

## Estructura

```text
crud-parametrizado-clientes-estandarizado/
├── app.js
├── package.json
├── .env.example
├── .gitignore
├── config/
│   └── db.js
├── sql/
│   └── clientes.sql
├── views/
│   ├── index.ejs
│   ├── error.ejs
│   └── partials/
├── public/
│   ├── css/style.css
│   └── js/app.js
└── capturas/
```

## Instalación

```bash
npm install
```

Copia `.env.example` como `.env` y completa tus credenciales:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_clave
DB_NAME=tu_base_de_datos
```

## Base de datos

Ejecuta `sql/clientes.sql` en pgAdmin. Si la tabla ya existe con las columnas `rut`, `nombre` y `edad`, el script no la volverá a crear y solo intentará agregar los datos de prueba faltantes.

## Ejecución

```bash
npm start
```

Abre:

```text
http://localhost:3000
```

## Endpoints

```text
GET    /clientes
GET    /clientes?rut=<rut>
GET    /clientes?edad=<n>
GET    /clientes?nombre=<texto>
POST   /clientes
PUT    /clientes/:rut
DELETE /clientes?rut=<rut>
DELETE /clientes?nombre=<texto>
DELETE /clientes?edad=<n>
```

## Respuestas

Consulta exitosa:

```json
{
  "ok": true,
  "data": []
}
```

Actualización o eliminación:

```json
{
  "ok": true,
  "rowCount": 1,
  "mensaje": "Actualizado correctamente"
}
```

Error:

```json
{
  "ok": false,
  "mensaje": "Cliente no existe"
}
```

## Capturas requeridas

Guarda en la carpeta `capturas` imágenes que demuestren:

1. Listado general.
2. Consulta por RUT.
3. Consulta por edad.
4. Consulta por nombre o prefijo.
5. Creación exitosa.
6. Error por RUT duplicado.
7. Modificación mostrando `rowCount`.
8. Eliminación por RUT.
9. Eliminación bloqueada por nombre o edad con múltiples coincidencias.
