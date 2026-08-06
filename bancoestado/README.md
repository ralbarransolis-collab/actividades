# Actividad 11 — BancoEstado con EJS

Aplicación académica construida con Node.js, Express, EJS, Bootstrap 5 y un archivo JSON local.

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

## Estructura

```text
actividad11-bancoestado-ejs/
├── app.js
├── package.json
├── data/
│   └── clientes.json
├── public/
│   └── css/
│       └── style.css
└── views/
    ├── index.ejs
    ├── error.ejs
    └── partials/
        ├── head.ejs
        ├── navbar.ejs
        └── footer.ejs
```

## Funcionalidades

- Listar todos los clientes y sus cuentas.
- Listar clientes con Cuenta RUT.
- Agregar cliente nuevo con Cuenta RUT.
- Agregar cliente nuevo con Cuenta de Ahorro.
- Agregar Cuenta RUT a un cliente existente.
- Agregar Cuenta de Ahorro a un cliente existente.
- Eliminar cliente y todas sus cuentas.
- Eliminar Cuenta RUT.
- Eliminar una Cuenta de Ahorro específica.

## Reglas aplicadas

- Máximo una Cuenta RUT por cliente.
- Varias cuentas de ahorro por cliente.
- No se permiten clientes sin al menos una cuenta.
- No se puede eliminar la última cuenta de un cliente.
- No se repiten RUT ni números de cuenta.

## EJS

Express lee `clientes.json` y renderiza `views/index.ejs` mediante `res.render()`. Los formularios envían solicitudes POST y, después de modificar el archivo JSON, el servidor redirige nuevamente a la página principal.
