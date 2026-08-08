Foto Talento - Subida de Imágenes con Express y Multer

Descripción

Aplicación desarrollada con Node.js, Express y Multer para subir imágenes desde un formulario HTML y guardarlas en el servidor.

La aplicación permite:

Seleccionar una imagen desde el computador.

Subir una sola imagen mediante POST /upload.

Validar tipo de archivo en el backend.

Limitar el tamaño máximo a 5 MB.

Guardar la imagen en la carpeta uploads/.

Asignar un nombre único al archivo.

Mostrar mensajes de éxito o error.

Mostrar una vista previa de la imagen.

Mostrar una galería simple con las imágenes guardadas.

Tecnologías utilizadas

Node.js

Express

Multer

HTML

JavaScript

Fetch API

Bootstrap

Nodemon

Estructura del proyecto

mi-app-subida/
├── uploads/
│   └── .gitkeep
├── public/
│   └── index.html
├── server.js
├── package.json
└── README.md

Instalación

npm install

Si se crea manualmente:

npm install express multer
npm install -D nodemon

Scripts

En package.json:

"scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
}

Para iniciar:

npm run dev

Luego abrir:

http://localhost:3000

Backend

El archivo principal es:

server.js

Se utilizan:

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

Carpeta uploads

Las imágenes se guardan en:

uploads/

Si la carpeta no existe, el servidor puede crearla automáticamente.

Multer

Multer es un middleware de Express que permite recibir archivos enviados mediante:

multipart/form-data

En esta aplicación se utiliza para:

recibir una imagen;

validar tipo MIME;

validar extensión;

controlar tamaño;

asignar un nombre único;

guardar el archivo.

Nombre único

Las imágenes se guardan usando:

Date.now()

Ejemplo:

1786134059123.jpg

Esto evita sobrescribir archivos con el mismo nombre.

Validaciones

Formatos permitidos:

jpg
jpeg
png
gif

Tipos MIME permitidos:

image/jpeg
image/png
image/gif

Tamaño máximo:

5 MB

La validación real se realiza en el backend. El atributo HTML:

accept="image/*"

solo ayuda al usuario a seleccionar archivos, pero no reemplaza la validación del servidor.

Endpoint POST /upload

Permite subir una sola imagen.

El campo debe llamarse:

foto

Por eso en el backend se utiliza:

upload.single("foto")

y en el HTML:

<input type="file" name="foto">

Ambos nombres deben coincidir.

Respuesta correcta

Código:

201 Created

Ejemplo:

{
    "ok": true,
    "mensaje": "Imagen subida correctamente",
    "archivo": "1786134059123.jpg",
    "ruta": "/uploads/1786134059123.jpg"
}

Tipo de archivo no permitido

Código:

415 Unsupported Media Type

Ejemplo:

{
    "ok": false,
    "mensaje": "Tipo de archivo no permitido. Solo jpg, jpeg, png o gif."
}

Archivo superior a 5 MB

Código:

400 Bad Request

Ejemplo:

{
    "ok": false,
    "mensaje": "La imagen supera el límite de 5 MB"
}

Frontend

El frontend se encuentra en:

public/index.html

El formulario utiliza:

<form action="/upload" method="POST" enctype="multipart/form-data">

El input es:

<input type="file" name="foto" accept="image/*" required>

Envío con FormData

JavaScript prepara el archivo con:

const datos = new FormData(form);

y lo envía con:

fetch("/upload", {
    method: "POST",
    body: datos
});

Cuando se usa FormData, no se debe configurar manualmente:

Content-Type: application/json

porque el navegador genera automáticamente el encabezado correcto para multipart/form-data.

Vista previa

Antes de subir la imagen se puede mostrar una vista previa utilizando:

URL.createObjectURL(archivo)

Imágenes públicas

La carpeta uploads se publica con Express:

app.use("/uploads", express.static(carpetaUploads));

Así una imagen queda disponible en una URL como:

http://localhost:3000/uploads/1786134059123.jpg

Galería

La aplicación incluye además:

GET /galeria

Esta ruta devuelve las imágenes guardadas en la carpeta uploads.

Ejemplo:

{
    "ok": true,
    "data": [
        {
            "nombre": "1786134059123.jpg",
            "ruta": "/uploads/1786134059123.jpg"
        }
    ]
}

Flujo de subida

Usuario selecciona imagen
        ↓
Formulario HTML
        ↓
FormData
        ↓
POST /upload
        ↓
Multer
        ↓
Valida tipo y tamaño
        ↓
Guarda en uploads/
        ↓
201 Created

Si el archivo es inválido:

Multer
   ↓
Error
   ↓
400 o 415

req.file

Después de una carga correcta, Multer guarda la información del archivo en:

req.file

Algunos datos disponibles son:

req.file.filename
req.file.mimetype
req.file.size
req.file.path

Pruebas recomendadas

Imagen válida

Subir una imagen JPG, JPEG, PNG o GIF de menos de 5 MB.

Resultado esperado:

201 Created

Archivo no permitido

Intentar subir:

documento.pdf

Resultado esperado:

415 Unsupported Media Type

Imagen demasiado grande

Intentar subir una imagen superior a 5 MB.

Resultado esperado:

400 Bad Request

.gitkeep

Conclusión

La aplicación implementa la subida de imágenes con Express y Multer, validando extensión, tipo MIME y tamaño máximo. Los archivos válidos se guardan en el servidor con un nombre único y el frontend muestra mensajes de éxito o error.