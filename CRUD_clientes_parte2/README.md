# Consultas parametrizadas II con Node + pg

Aplicación desarrollada con Node.js, Express, EJS, PostgreSQL y `pg`. Amplía el CRUD anterior incorporando filtros y eliminaciones por criterios, siempre mediante consultas parametrizadas.

## Requisitos

- Node.js
- PostgreSQL
- Una base de datos creada
- Tabla `clientes` con `rut`, `nombre` y `edad`

## Instalación

```bash
npm install
```



## Base de datos

Ejecutar en pgAdmin:

```text
sql/clientes.sql
```

## Inicio

```bash
npm start
```

Abrir:

```text
http://localhost:3000
```

## Endpoints

### Consultas

```text
GET /clientes
GET /clientes?rut=12345678-5
GET /clientes?edad=28
GET /clientes?edadMin=20&edadMax=30
GET /clientes?nombre=An
```

La búsqueda por nombre utiliza `ILIKE` y coincide con el nombre completo o con su prefijo.

### Crear

```text
POST /clientes
```

Body JSON:

```json
{
  "rut": "20111222-3",
  "nombre": "Pedro López",
  "edad": 27
}
```

### Modificar únicamente el nombre

```text
PUT /clientes/20111222-3
```

```json
{
  "nombre": "Pedro Ignacio López"
}
```

### Eliminar

```text
DELETE /clientes/20111222-3
DELETE /clientes?edad=28
DELETE /clientes?edadMin=20&edadMax=30
```

Las eliminaciones por edad y rango responden con los nombres eliminados.

## Códigos HTTP

- `200`: operación correcta
- `201`: cliente creado
- `400`: datos o criterios inválidos
- `404`: cliente o coincidencias no encontradas
- `409`: RUT duplicado
- `405`: método no permitido
- `500`: error interno

## Consultas parametrizadas

Ejemplo:

```javascript
const consulta = {
    text: `
        SELECT rut, nombre, edad
        FROM clientes
        WHERE edad BETWEEN $1 AND $2
    `,
    values: [edadMin, edadMax]
};

const resultado = await pool.query(consulta);
```

Los valores se envían separados del SQL, evitando concatenar directamente datos del usuario.

## Entrega

El proyecto incluye la carpeta `capturas` con el listado de evidencias que deben obtenerse en el computador local, porque requieren la conexión real a PostgreSQL.
