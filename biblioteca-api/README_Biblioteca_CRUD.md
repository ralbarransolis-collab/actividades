# Biblioteca - CRUD REST con Express y File System

## Descripción

Aplicación desarrollada con **Node.js + Express** para administrar un catálogo de libros almacenado en un archivo local `catalogo.json`.

La aplicación permite realizar un CRUD completo:

- Crear libros.
- Listar libros.
- Editar libros.
- Eliminar libros.

Los datos se guardan directamente en el archivo JSON utilizando lectura y escritura asíncrona con `fs/promises`.

---

## Tecnologías utilizadas

- Node.js
- Express
- File System (`fs/promises`)
- HTML
- JavaScript
- Fetch API
- Bootstrap
- Nodemon

---

## Estructura del proyecto

```text
biblioteca-api/
│
├── index.js
├── catalogo.json
├── package.json
├── package-lock.json
├── README.md
│
├── public/
│   └── index.html
│
└── node_modules/
```

---

## Archivo de datos

El archivo `catalogo.json` contiene los libros.

Ejemplo:

```json
[
    {
        "id": 1,
        "titulo": "Cien años de soledad",
        "autor": "Gabriel García Márquez",
        "anio": 1967
    },
    {
        "id": 2,
        "titulo": "1984",
        "autor": "George Orwell",
        "anio": 1949
    }
]
```

Cada libro contiene:

- `id`
- `titulo`
- `autor`
- `anio`

---

## Instalación

Crear el proyecto:

```bash
npm init -y
```

Instalar Express:

```bash
npm install express
```

Instalar Nodemon:

```bash
npm install -D nodemon
```

---

## Scripts

En `package.json` se utilizan:

```json
"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
}
```

Para ejecutar normalmente:

```bash
npm start
```

Para ejecutar con Nodemon:

```bash
npm run dev
```

---

# Backend

El servidor se encuentra en `index.js`.

Se utiliza:

```js
const express = require("express");
const fs = require("fs/promises");
const path = require("path");
```

También se habilita el uso de JSON:

```js
app.use(express.json());
```

Y se publica el frontend:

```js
app.use(express.static(path.join(__dirname, "public")));
```

---

## Lectura del catálogo

La función `leerCatalogo()` utiliza:

```js
await fs.readFile(rutaCatalogo, "utf-8");
```

Luego convierte el contenido JSON a un arreglo de JavaScript:

```js
JSON.parse(contenido);
```

Si el archivo no existe, se crea automáticamente con:

```json
[]
```

---

## Escritura del catálogo

La función `guardarCatalogo()` utiliza:

```js
await fs.writeFile(
    rutaCatalogo,
    JSON.stringify(libros, null, 2)
);
```

De esta forma, los cambios realizados en la aplicación quedan guardados físicamente en `catalogo.json`.

---

# Endpoints

## GET /libros

Devuelve todos los libros.

```text
GET /libros
```

Ejemplo:

```text
http://localhost:3000/libros
```

Respuesta:

```json
{
    "ok": true,
    "data": [
        {
            "id": 1,
            "titulo": "Cien años de soledad",
            "autor": "Gabriel García Márquez",
            "anio": 1967
        }
    ]
}
```

Código HTTP:

```text
200 OK
```

---

## POST /libros

Permite crear un nuevo libro.

```text
POST /libros
```

Body JSON:

```json
{
    "titulo": "Rayuela",
    "autor": "Julio Cortázar",
    "anio": 1963
}
```

El servidor genera automáticamente el nuevo ID utilizando el ID mayor existente más 1.

Ejemplo:

```text
IDs actuales: 1, 2, 3
Nuevo ID: 4
```

Si la creación es correcta:

```text
201 Created
```

Si faltan datos o el año no es válido:

```text
400 Bad Request
```

---

## PUT /libros/:id

Permite actualizar un libro existente.

Ejemplo:

```text
PUT /libros/1
```

Body:

```json
{
    "titulo": "Cien años de soledad",
    "autor": "G. G. Márquez",
    "anio": 1967
}
```

Si el libro existe:

```text
200 OK
```

Si el ID no existe:

```text
404 Not Found
```

Si los datos son inválidos:

```text
400 Bad Request
```

---

## DELETE /libros/:id

Permite eliminar un libro.

Ejemplo:

```text
DELETE /libros/2
```

Si el libro existe:

```text
200 OK
```

Si el ID no existe:

```text
404 Not Found
```

Después de eliminar, el archivo `catalogo.json` se vuelve a escribir sin ese libro.

---

# Códigos HTTP utilizados

| Operación | Resultado | Código |
|---|---|---:|
| GET | Correcto | 200 |
| POST | Libro creado | 201 |
| POST | Datos inválidos | 400 |
| PUT | Actualizado | 200 |
| PUT | Datos inválidos | 400 |
| PUT | Libro no encontrado | 404 |
| DELETE | Eliminado | 200 |
| DELETE | Libro no encontrado | 404 |

---

# Formato de respuestas

Respuesta correcta:

```json
{
    "ok": true,
    "data": {}
}
```

Respuesta con error:

```json
{
    "ok": false,
    "mensaje": "detalle del error"
}
```

---

# Frontend

El frontend se encuentra en:

```text
public/index.html
```

La interfaz permite:

- Ver todos los libros.
- Crear un nuevo libro.
- Editar un libro existente.
- Eliminar un libro.

La comunicación con el backend se realiza mediante `fetch()`.

---

## Listar libros

El frontend realiza:

```js
fetch("/libros");
```

Esto corresponde a:

```text
GET /libros
```

---

## Crear libro

Cuando se utiliza el formulario para un libro nuevo:

```text
POST /libros
```

El frontend envía:

```js
fetch("/libros", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(libro)
});
```

---

## Editar libro

Al presionar el botón `Editar`, el formulario se completa con los datos actuales.

Después se envía:

```text
PUT /libros/:id
```

Ejemplo:

```text
PUT /libros/3
```

---

## Eliminar libro

Al presionar `Eliminar`, el frontend solicita confirmación.

Luego envía:

```text
DELETE /libros/:id
```

Ejemplo:

```text
DELETE /libros/3
```

---

# Flujo de la aplicación

```text
Usuario
   ↓
index.html
   ↓
JavaScript
   ↓
fetch()
   ↓
Express
   ↓
fs/promises
   ↓
catalogo.json
```

Por ejemplo, al crear un libro:

```text
Formulario
   ↓
POST /libros
   ↓
Express
   ↓
leerCatalogo()
   ↓
Agregar libro al arreglo
   ↓
guardarCatalogo()
   ↓
catalogo.json actualizado
```

---

# Lectura y escritura asíncrona

La actividad utiliza `fs/promises`.

Esto permite trabajar con:

```js
await fs.readFile(...)
await fs.writeFile(...)
```

sin bloquear el Event Loop de Node.js.

No se utilizan métodos síncronos como:

```js
fs.readFileSync()
fs.writeFileSync()
```

---

# Pruebas

Ejecutar:

```bash
npm run dev
```

Luego abrir:

```text
http://localhost:3000
```

También se puede probar directamente la API.

### GET

```text
http://localhost:3000/libros
```

### POST

```text
POST http://localhost:3000/libros
```

Body:

```json
{
    "titulo": "El principito",
    "autor": "Antoine de Saint-Exupéry",
    "anio": 1943
}
```

### PUT

```text
PUT http://localhost:3000/libros/1
```

### DELETE

```text
DELETE http://localhost:3000/libros/2
```

---

# Resultado esperado

La aplicación permite realizar un CRUD REST completo:

```text
GET     /libros       → listar
POST    /libros       → crear
PUT     /libros/:id   → actualizar
DELETE  /libros/:id   → eliminar
```

Los cambios quedan persistidos en:

```text
catalogo.json
```

---

# Conclusión

La aplicación cumple con los fundamentos de un CRUD REST utilizando Express y File System.

Se implementan los métodos HTTP `GET`, `POST`, `PUT` y `DELETE`, se manejan cuerpos JSON mediante `express.json()`, se utilizan códigos HTTP adecuados y la persistencia se realiza mediante lectura y escritura asíncrona con `fs/promises`.
