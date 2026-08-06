# Reto KINO con Node.js, Express y EJS

## Requisitos cumplidos

- Servicio web en Node.js y Express.
- `GET /api/cartones`: entrega todos los cartones en JSON.
- `POST /api/cartones`: crea un nuevo cartón.
- Cada cartón tiene 15 números únicos entre 1 y 30.
- Cada cartón tiene un número de serie único.
- Al iniciar el servidor se crean automáticamente 5 cartones.
- Frontend con tres páginas:
  - Menú principal.
  - Listado de cartones.
  - Creación de un nuevo cartón.
- Estilos con Bootstrap 5.

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

## Rutas

### Páginas

- `GET /`
- `GET /cartones`
- `GET /cartones/nuevo`

### Servicio web

- `GET /api/cartones`
- `POST /api/cartones`

Los demás métodos sobre `/api/cartones` responden con código HTTP 405.
