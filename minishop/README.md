# MiniShop con Express y Handlebars

Aplicación desarrollada para el ejercicio práctico de Node.js, Express y Handlebars.

## Requisitos

- Node.js instalado.
- npm instalado.

## Instalación

Abre una terminal dentro de la carpeta del proyecto y ejecuta:

```bash
npm install
```

## Ejecutar

```bash
npm start
```

Después abre en el navegador:

```text
http://localhost:3000
```

## Rutas

- `GET /`: página principal y catálogo.
- `GET /about`: información de la tienda.
- `GET /contact`: formulario de contacto.
- `POST /contact`: procesa el formulario.

## Probar el error 405

En Thunder Client o Postman, envía por ejemplo:

```text
PUT http://localhost:3000/
```

La respuesta debe ser:

```text
Método no permitido
```
