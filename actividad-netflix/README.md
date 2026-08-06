# Actividad 7 — Catálogo de películas y series

Proyecto desarrollado con Node.js y Express. Los datos se almacenan en archivos TXT separados y se leen/escriben con `fs.promises`, de forma no bloqueante.

## Importante

Esta entrega corresponde solamente a la Actividad 7. No incluye las clases `Pelicula` y `Serie` solicitadas posteriormente en la Actividad 8.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

Abrir en el navegador:

```text
http://localhost:3000
```

## API

### Listar películas

```text
GET /api/catalogo?tipo=peliculas
```

### Listar series

```text
GET /api/catalogo?tipo=series
```

### Agregar película

```text
POST /api/catalogo?tipo=peliculas
Content-Type: application/json
```

```json
{
  "nombre": "Gladiador",
  "director": "Ridley Scott",
  "anio": 2000
}
```

### Agregar serie

```text
POST /api/catalogo?tipo=series
Content-Type: application/json
```

```json
{
  "nombre": "The Crown",
  "anio": 2016,
  "temporadas": 6
}
```

### Eliminar película

```text
DELETE /api/catalogo/Gladiador?tipo=peliculas
```

### Eliminar serie

```text
DELETE /api/catalogo/The%20Crown?tipo=series
```

### Método no permitido

Prueba, por ejemplo:

```text
PUT /api/catalogo?tipo=peliculas
```

Debe responder con estado HTTP 405.
