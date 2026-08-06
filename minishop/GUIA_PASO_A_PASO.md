# Guía simple del proyecto MiniShop

## 1. ¿Qué archivo se ejecuta?

El archivo principal es `app.js`. Allí se configura Express, Handlebars, las rutas y los datos de los productos.

## 2. ¿Cómo se conectan las vistas?

Cuando se visita una ruta, Express usa `res.render()` para cargar una vista:

- `/` carga `views/home.handlebars`.
- `/about` carga `views/about.handlebars`.
- `/contact` carga `views/contact.handlebars`.
- El formulario enviado carga `views/success.handlebars`.

Todas las vistas se insertan dentro de `views/layouts/main.handlebars`, específicamente donde aparece:

```handlebars
{{{body}}}
```

## 3. ¿Qué son los partials?

Son fragmentos reutilizables:

- `views/partials/navbar.handlebars`: menú de navegación.
- `views/partials/footer.handlebars`: contenido del pie de página.

Se cargan en el layout con:

```handlebars
{{> navbar}}
{{> footer}}
```

## 4. Handlebars usado en el ejercicio

### Mostrar una variable

```handlebars
{{nombreTienda}}
```

### Recorrer productos

```handlebars
{{#each productos}}
    {{nombre}}
{{/each}}
```

### Evaluar disponibilidad

```handlebars
{{#if disponible}}
    En stock
{{else}}
    Agotado
{{/if}}
```

### Usar el helper

```handlebars
{{mayusculas nombreTienda}}
```

## 5. Formulario

El formulario usa:

```html
<form action="/contact" method="POST">
```

Express recibe los datos mediante `req.body` en la ruta `POST /contact`.

## 6. Ejecución

En la terminal, dentro de la carpeta del proyecto:

```bash
npm install
npm start
```

Luego abre:

```text
http://localhost:3000
```
