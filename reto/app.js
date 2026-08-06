const express = require('express');
const path = require('path');

const app = express();
const puerto = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const cartones = [];
let siguienteSerie = 1;

function generarNumeros() {
    const numeros = new Set();

    while (numeros.size < 15) {
        const numeroAleatorio = Math.floor(Math.random() * 30) + 1;
        numeros.add(numeroAleatorio);
    }

    return Array.from(numeros).sort((a, b) => a - b);
}

function crearCarton() {
    const carton = {
        serie: siguienteSerie,
        numeros: generarNumeros()
    };

    siguienteSerie += 1;
    cartones.push(carton);

    return carton;
}

// El servicio crea cinco cartones antes de comenzar a atender solicitudes.
for (let i = 0; i < 5; i += 1) {
    crearCarton();
}

// -------------------- PÁGINAS --------------------

app.get('/', (req, res) => {
    res.render('index', {
        titulo: 'Menú principal'
    });
});

app.get('/cartones', (req, res) => {
    res.render('cartones', {
        titulo: 'Listado de cartones'
    });
});

app.get('/cartones/nuevo', (req, res) => {
    res.render('nuevo-carton', {
        titulo: 'Crear nuevo cartón'
    });
});

// -------------------- SERVICIO WEB / API --------------------

app.get('/api/cartones', (req, res) => {
    res.status(200).json(cartones);
});

app.post('/api/cartones', (req, res) => {
    const nuevoCarton = crearCarton();

    res.status(201).json({
        mensaje: 'Cartón creado correctamente',
        carton: nuevoCarton
    });
});

app.all('/api/cartones', (req, res) => {
    res.status(405).json({
        mensaje: 'Método no permitido. Solo se aceptan GET y POST.'
    });
});

app.use((req, res) => {
    res.status(404).render('error', {
        titulo: 'Página no encontrada',
        codigo: 404,
        mensaje: 'La ruta solicitada no existe.'
    });
});

app.listen(puerto, () => {
    console.log(`Servidor funcionando en http://localhost:${puerto}`);
    console.log(`Cartones creados al iniciar: ${cartones.length}`);
});
