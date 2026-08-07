API REST - Usuarios y Productos

Descripción

Aplicación básica desarrollada con Node.js y Express para practicar los fundamentos de una API REST.

La API trabaja con dos recursos:

usuarios

productos

Los datos se almacenan en archivos JSON y se consultan mediante rutas GET.

La API utiliza versionamiento con el prefijo:

/api/v1

Tecnologías utilizadas

Node.js

Express

Nodemon

JSON

API REST

Estructura del proyecto

api-rest/
│
├── index.js
├── usuarios.json
├── productos.json
├── package.json
├── package-lock.json
└── node_modules/

Instalación

Crear el proyecto:

npm init -y

Instalar Express:

npm install express

Instalar Nodemon como dependencia de desarrollo:

npm install -D nodemon

Scripts

En package.json se agregan los siguientes scripts:

"scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
}

Para iniciar normalmente:

npm start

Para trabajar con Nodemon:

npm run dev

Nodemon reinicia automáticamente el servidor cuando se guardan cambios.

Datos de usuarios

Archivo:

usuarios.json

Contenido:

[
    { "id": 1, "nombre": "Ana" },
    { "id": 2, "nombre": "Luis" },
    { "id": 3, "nombre": "Carlos" }
]

Datos de productos

Archivo:

productos.json

Contenido:

[
    { "id": 1, "nombre": "Teclado", "precio": 19990 },
    { "id": 2, "nombre": "Mouse", "precio": 9990 },
    { "id": 3, "nombre": "Monitor", "precio": 129990 }
]

Archivo principal

El archivo index.js configura Express y carga los archivos JSON:

const express = require("express");
const usuarios = require("./usuarios.json");
const productos = require("./productos.json");

const app = express();
const puerto = 3000;

app.use(express.json());

Endpoints

GET /api/v1/usuarios

Entrega la lista completa de usuarios.

http://localhost:3000/api/v1/usuarios

Respuesta:

{
    "ok": true,
    "data": [
        { "id": 1, "nombre": "Ana" },
        { "id": 2, "nombre": "Luis" },
        { "id": 3, "nombre": "Carlos" }
    ]
}

Código HTTP:

200 OK

GET /api/v1/usuarios/

Entrega un usuario según su ID.

Ejemplo:

http://localhost:3000/api/v1/usuarios/2

Respuesta:

{
    "ok": true,
    "data": {
        "id": 2,
        "nombre": "Luis"
    }
}

Si el usuario no existe:

{
    "ok": false,
    "mensaje": "Usuario no encontrado"
}

Código HTTP:

404 Not Found

GET /api/v1/productos

Entrega la lista completa de productos.

http://localhost:3000/api/v1/productos

Respuesta:

{
    "ok": true,
    "data": [
        {
            "id": 1,
            "nombre": "Teclado",
            "precio": 19990
        },
        {
            "id": 2,
            "nombre": "Mouse",
            "precio": 9990
        },
        {
            "id": 3,
            "nombre": "Monitor",
            "precio": 129990
        }
    ]
}

Código HTTP:

200 OK

GET /api/v1/productos/

Entrega un producto según su ID.

Ejemplo:

http://localhost:3000/api/v1/productos/3

Respuesta:

{
    "ok": true,
    "data": {
        "id": 3,
        "nombre": "Monitor",
        "precio": 129990
    }
}

Si el producto no existe:

{
    "ok": false,
    "mensaje": "Producto no encontrado"
}

Código HTTP:

404 Not Found

Versionamiento

La API utiliza el prefijo:

/api/v1

Esto indica que se está utilizando la versión 1 de la API.

Ejemplo:

/api/v1/usuarios
/api/v1/productos

En el futuro podría existir otra versión:

/api/v2/usuarios
/api/v2/productos

sin modificar las aplicaciones que utilicen la versión anterior.

Buenas prácticas REST utilizadas

Recursos en plural

Se utilizan nombres en plural:

usuarios
productos

Uso de métodos HTTP

En esta actividad se utiliza:

GET

para consultar información.

Códigos de estado

Se utilizan:

200 OK

cuando la consulta es correcta.

Y:

404 Not Found

cuando no existe el usuario o producto solicitado.

Formato de respuesta

Respuesta exitosa:

{
    "ok": true,
    "data": {}
}

Respuesta de error:

{
    "ok": false,
    "mensaje": "Recurso no encontrado"
}

Pruebas

Ejecutar:

npm run dev

Luego probar en el navegador, Postman o Thunder Client:

http://localhost:3000/api/v1/usuarios
http://localhost:3000/api/v1/usuarios/2
http://localhost:3000/api/v1/productos
http://localhost:3000/api/v1/productos/3

También se puede probar un ID inexistente:

http://localhost:3000/api/v1/usuarios/99

Respuesta esperada:

{
    "ok": false,
    "mensaje": "Usuario no encontrado"
}

Funcionamiento general

El flujo de la aplicación es:

Cliente
   ↓
Petición GET
   ↓
Express
   ↓
Archivo JSON
   ↓
Respuesta JSON

Por ejemplo:

GET /api/v1/productos/2
        ↓
Express recibe el ID 2
        ↓
Busca el producto en productos.json
        ↓
Encuentra Mouse
        ↓
Responde con código 200 y JSON

Conclusión

Esta aplicación permite practicar los fundamentos de una API REST utilizando Express.

Se implementan recursos en plural, versionamiento, rutas GET, parámetros por ID, códigos HTTP y respuestas en formato JSON.

Los datos se obtienen desde archivos locales usuarios.json y productos.json, sin utilizar base de datos, ya que el objetivo de la actividad es comprender la estructura y funcionamiento básico de