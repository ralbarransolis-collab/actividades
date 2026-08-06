const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const Pelicula = require('./models/Pelicula');
const Serie = require('./models/Serie');

const app = express();
const puerto = process.env.PORT || 3000;

const rutaPeliculas = path.join(__dirname, 'data', 'peliculas.txt');
const rutaSeries = path.join(__dirname, 'data', 'series.txt');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function obtenerRutaArchivo(tipo) {
    if (tipo === 'peliculas') {
        return rutaPeliculas;
    }

    if (tipo === 'series') {
        return rutaSeries;
    }

    return null;
}

function convertirLineasAObjetos(contenido, tipo) {
    const lineas = contenido
        .split(/\r?\n/)
        .map(linea => linea.trim())
        .filter(linea => linea !== '');

    if (tipo === 'peliculas') {
        return lineas.map(linea => Pelicula.crearDesdeLinea(linea));
    }

    if (tipo === 'series') {
        return lineas.map(linea => Serie.crearDesdeLinea(linea));
    }

    return [];
}

function convertirObjetoALinea(registro, tipo) {
    if (tipo === 'peliculas' && registro instanceof Pelicula) {
        return registro.convertirALinea();
    }

    if (tipo === 'series' && registro instanceof Serie) {
        return registro.convertirALinea();
    }

    throw new Error('El registro no corresponde al tipo indicado.');
}

function validarRegistro(registro, tipo) {
    if (!registro || typeof registro !== 'object') {
        return 'El body debe contener un objeto JSON.';
    }

    const nombre = String(registro.nombre || '').trim();

    if (!nombre) {
        return 'El nombre es obligatorio.';
    }

    if (nombre.includes(',')) {
        return 'El nombre no puede contener comas.';
    }

    if (tipo === 'peliculas') {
        const director = String(registro.director || '').trim();
        const anio = Number(registro.anio);

        if (!director || !Number.isInteger(anio)) {
            return 'La película debe incluir nombre, director y año válido.';
        }

        if (director.includes(',')) {
            return 'El director no puede contener comas.';
        }
    }

    if (tipo === 'series') {
        const anio = Number(registro.anio);
        const temporadas = Number(registro.temporadas);

        if (!Number.isInteger(anio) || !Number.isInteger(temporadas) || temporadas < 1) {
            return 'La serie debe incluir nombre, año válido y número de temporadas mayor que cero.';
        }
    }

    return null;
}

function crearInstancia(registro, tipo) {
    if (tipo === 'peliculas') {
        return new Pelicula(
            registro.nombre,
            registro.director,
            registro.anio
        );
    }

    if (tipo === 'series') {
        return new Serie(
            registro.nombre,
            registro.anio,
            registro.temporadas
        );
    }

    return null;
};

// GET: listar películas o series usando el parámetro ?tipo=
app.get('/api/catalogo', async (req, res) => {
    try {
        const tipo = req.query.tipo;
        const rutaArchivo = obtenerRutaArchivo(tipo);

        if (!rutaArchivo) {
            return res.status(400).json({
                mensaje: 'El parámetro tipo debe ser peliculas o series.'
            });
        }

        const contenido = await fs.readFile(rutaArchivo, 'utf-8');
        const registros = convertirLineasAObjetos(contenido, tipo);

        return res.status(200).json(registros);
    }
    catch (error) {
        console.error('Error leyendo el catálogo:', error.message);

        return res.status(500).json({
            mensaje: 'No fue posible leer el archivo del catálogo.'
        });
    }
});

// POST: agregar una película o serie recibida en formato JSON
app.post('/api/catalogo', async (req, res) => {
    try {
        const tipo = req.query.tipo;
        const rutaArchivo = obtenerRutaArchivo(tipo);

        if (!rutaArchivo) {
            return res.status(400).json({
                mensaje: 'El parámetro tipo debe ser peliculas o series.'
            });
        }

        const errorValidacion = validarRegistro(req.body, tipo);

        if (errorValidacion) {
            return res.status(400).json({ mensaje: errorValidacion });
        }

        const contenido = await fs.readFile(rutaArchivo, 'utf-8');
        const registros = convertirLineasAObjetos(contenido, tipo);
        const nombreBuscado = String(req.body.nombre).trim().toLowerCase();

        const existe = registros.some(registro =>
            registro.nombre.toLowerCase() === nombreBuscado
        );

        if (existe) {
            return res.status(409).json({
                mensaje: `Ya existe un registro llamado ${req.body.nombre}.`
            });
        }

        const nuevoRegistro = crearInstancia(req.body, tipo);
        const nuevaLinea = convertirObjetoALinea(nuevoRegistro, tipo);
        const separador = contenido.length > 0 && !contenido.endsWith('\n') ? '\n' : '';

        await fs.appendFile(
            rutaArchivo,
            `${separador}${nuevaLinea}\n`,
            'utf-8'
        );

        return res.status(201).json({
            mensaje: `${tipo === 'peliculas' ? 'Película' : 'Serie'} agregada correctamente.`,
            registro: nuevoRegistro
        });
    }
    catch (error) {
        console.error('Error agregando al catálogo:', error.message);

        return res.status(500).json({
            mensaje: 'No fue posible guardar el nuevo registro.'
        });
    }
});

// DELETE: eliminar una película o serie por nombre
app.delete('/api/catalogo/:nombre', async (req, res) => {
    try {
        const tipo = req.query.tipo;
        const rutaArchivo = obtenerRutaArchivo(tipo);

        if (!rutaArchivo) {
            return res.status(400).json({
                mensaje: 'El parámetro tipo debe ser peliculas o series.'
            });
        }

        const nombre = String(req.params.nombre).trim();
        const contenido = await fs.readFile(rutaArchivo, 'utf-8');
        const registros = convertirLineasAObjetos(contenido, tipo);

        const registrosRestantes = registros.filter(registro =>
            registro.nombre.toLowerCase() !== nombre.toLowerCase()
        );

        if (registrosRestantes.length === registros.length) {
            return res.status(404).json({
                mensaje: `No se encontró un registro llamado ${nombre}.`
            });
        }

        const nuevoContenido = registrosRestantes
            .map(registro => convertirObjetoALinea(registro, tipo))
            .join('\n');

        await fs.writeFile(
            rutaArchivo,
            nuevoContenido ? `${nuevoContenido}\n` : '',
            'utf-8'
        );

        return res.status(200).json({
            mensaje: `${tipo === 'peliculas' ? 'Película' : 'Serie'} eliminada correctamente.`
        });
    }
    catch (error) {
        console.error('Error eliminando del catálogo:', error.message);

        return res.status(500).json({
            mensaje: 'No fue posible eliminar el registro.'
        });
    }
});

// Rechazar otros métodos HTTP en las rutas válidas de la API
app.all('/api/catalogo', (req, res) => {
    return res.status(405).json({
        mensaje: 'Método no permitido.'
    });
});

app.all('/api/catalogo/:nombre', (req, res) => {
    return res.status(405).json({
        mensaje: 'Método no permitido.'
    });
});

app.use((req, res) => {
    return res.status(404).json({
        mensaje: 'Ruta no encontrada.'
    });
});

app.listen(puerto, () => {
    console.log(`Servidor ejecutándose en http://localhost:${puerto}`);
});
