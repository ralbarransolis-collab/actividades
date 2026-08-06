# Actividad 8: catálogo Netflix con Express y clases

Esta entrega continúa la Actividad 7 y agrega las clases `Pelicula` y `Serie` en archivos separados.

## Requisitos implementados

- Node.js y Express.
- Rutas `app.get()`, `app.post()` y `app.delete()`.
- Respuestas JSON.
- Archivos locales separados para películas y series.
- Lectura y escritura no bloqueante con `fs.promises`.
- Clase `Pelicula` en `clases/Pelicula.js`.
- Clase `Serie` en `clases/Serie.js`.
- Uso real de las clases al leer, crear y reescribir registros.
- Cliente web para listar, ordenar, agregar y eliminar.
- Respuesta 405 para métodos no permitidos.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

Abrir:

```text
http://localhost:3000
```

## Rutas

```text
GET    /api/catalogo?tipo=peliculas
GET    /api/catalogo?tipo=series
POST   /api/catalogo?tipo=peliculas
POST   /api/catalogo?tipo=series
DELETE /api/catalogo/:nombre?tipo=peliculas
DELETE /api/catalogo/:nombre?tipo=series
```
