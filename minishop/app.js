const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();
const puerto = process.env.PORT || 3000;

// Configuración de Handlebars como motor de plantillas.
app.engine(
    'handlebars',
    engine({
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
        partialsDir: path.join(__dirname, 'views', 'partials'),
        helpers: {
            mayusculas(texto) {
                return String(texto).toUpperCase();
            }
        }
    })
);

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Permite recibir los datos enviados desde formularios HTML.
app.use(express.urlencoded({ extended: false }));

// Permite usar CSS e imágenes guardadas dentro de public.
app.use(express.static(path.join(__dirname, 'public')));

const nombreTienda = 'MiniShop';
const mensajeBienvenida =
    'Encuentra ropa y accesorios para complementar tu estilo.';

const productos = [
    {
        nombre: 'Camiseta Básica',
        material:'Lino',
        precio: 15000,
        disponible: true,
        imagen: '/img/camiseta.svg'
    },
    {
        nombre: 'Pantalón Jeans',
        material: 'Mezclilla',
        precio: 29990,
        disponible: false,
        imagen: '/img/pantalon.svg'
    },
    {
        nombre: 'Zapatos Deportivos',
        material: 'Cuero',
        precio: 59990,
        disponible: true,
        imagen: '/img/zapatos.svg'
    },
    {
        nombre: 'Chaqueta de Cuero',
        material: 'Cuero Sintético',
        precio: 79990,
        disponible: true,
        imagen: '/img/chaqueta.svg'
    },
    {
        nombre: 'Gorra Clásica',
        material: 'Algodón',
        precio: 11990,
        disponible: true,
        imagen: '/img/gorra.svg'
    },
    {
        nombre: 'Bolso de Mano',
        material: 'Cuero vegetal',
        precio: 45990,
        disponible: false,
        imagen: '/img/bolso.svg'
    },
    {
        nombre: 'Reloj Digital',
        material: 'PVC',
        precio: 60990,
        disponible: true,
        imagen: '/img/reloj.svg'
    },
    {
        nombre: 'Bufanda de Lana',
        material: 'Lana Merino',
        precio: 18990,
        disponible: true,
        imagen: '/img/bufanda.svg'
    },
    {
        nombre: 'Sudadera Hoodie',
        material: 'ALgodón',
        precio: 35990,
        disponible: false,
        imagen: '/img/sudadera.svg'
    },
    {
        nombre: 'Gafas de Sol',
        material: 'Celuloide',
        precio: 25990,
        disponible: true,
        imagen: '/img/gafas.svg'
    }
];

// Página principal.
app.get('/', (req, res) => {
    res.render('home', {
        titulo: 'Inicio',
        nombreTienda,
        mensajeBienvenida,
        productos
    });
});

// Página de información.
app.get('/about', (req, res) => {
    res.render('about', {
        titulo: 'Nosotros',
        nombreTienda
    });
});

// Muestra el formulario de contacto.
app.get('/contact', (req, res) => {
    res.render('contact', {
        titulo: 'Contacto',
        nombreTienda
    });
});

// Procesa el formulario de contacto.
app.post('/contact', (req, res) => {
    const { nombre, correo, mensaje } = req.body;

    if (!nombre || !correo || !mensaje) {
        return res.status(400).render('contact', {
            titulo: 'Contacto',
            nombreTienda,
            error: 'Todos los campos son obligatorios.',
            datos: { nombre, correo, mensaje }
        });
    }

    return res.render('success', {
        titulo: 'Mensaje enviado',
        nombreTienda,
        nombre
    });
});

// Las rutas existen, pero otros métodos HTTP no están permitidos.
app.use((req, res, next) => {
    const rutasValidas = ['/', '/about', '/contact'];

    if (rutasValidas.includes(req.path)) {
        return res.status(405).send('Método no permitido');
    }

    return next();
});

// Ruta no encontrada.
app.use((req, res) => {
    res.status(404).send('Ruta no encontrada');
});

app.listen(puerto, () => {
    console.log(`MiniShop funcionando en http://localhost:${puerto}`);
});
