# Evaluación — Registro Civil de Mascotas

Proyecto desarrollado con Node.js, Express, archivo JSON, EJS, Axios y Bootstrap.

## Instalación

```bash
npm install
npm start
```

Abrir `http://localhost:3000`.

## Servicio web

### Listar todas las mascotas

```http
GET /api/mascotas
```

### Buscar por nombre

```http
GET /api/mascotas?nombre=Luna
```

### Buscar por RUT

```http
GET /api/mascotas?rut=12345678-5
```

### Registrar mascota

```http
POST /api/mascotas
Content-Type: application/json
```

```json
{
  "nombre": "Toby",
  "rut": "12345678-5"
}
```

### Eliminar por nombre

```http
DELETE /api/mascotas?nombre=Toby
```

### Eliminar todas las mascotas de un RUT

```http
DELETE /api/mascotas?rut=12345678-5
```

## Almacenamiento

Los registros se guardan en `data/mascotas.json`. Las operaciones de lectura y escritura utilizan `fs.promises`, por lo que son no bloqueantes.
