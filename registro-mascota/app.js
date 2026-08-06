const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const puerto = process.env.PORT || 3000;
const rutaMascotas = path.join(__dirname, 'data', 'mascotas.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

async function leerMascotas() {
    const contenido = await fs.readFile(rutaMascotas, 'utf-8');

    if (contenido.trim() === '') {
        return [];
    }

    const mascotas = JSON.parse(contenido);

    if (!Array.isArray(mascotas)) {
        throw new Error('El archivo mascotas.json no contiene un arreglo válido.');
    }

    return mascotas;
}

async function guardarMascotas(mascotas) {
    const contenido = JSON.stringify(mascotas, null, 2);
    await fs.writeFile(rutaMascotas, contenido, 'utf-8');
}

function textoValido(valor) {
    return typeof valor === 'string' && valor.trim() !== '';
}

function normalizarTexto(valor) {
    return String(valor).trim().toLowerCase();
}

app.get('/', (req, res) => {
    res.render('index', {
        titulo: 'Registro Civil de Mascotas'
    });
});

// GET sin parámetros: retorna todas las mascotas.
// GET ?nombre=: retorna la mascota correspondiente.
// GET ?rut=: retorna todas las mascotas asociadas al RUT.
app.get('/api/mascotas', async (req, res) => {
    try {
        const { nombre, categoria, rut } = req.query;

        if (nombre && rut) {
            return res.status(400).json({
                mensaje: 'Debe buscar por nombre o por RUT, no por ambos parámetros.'
            });
        }

        const mascotas = await leerMascotas();

        if (nombre) {
            const mascota = mascotas.find((registro) =>
                normalizarTexto(registro.nombre) === normalizarTexto(nombre)
            );

            if (!mascota) {
                return res.status(404).json({
                    mensaje: `No existe una mascota con el nombre ${nombre}.`
                });
            }

            return res.status(200).json(mascota);
        }

        if (categoria) {
            const mascotasPorCategoria = mascotas.filter((registro) =>
                textoValido(registro.categoria) &&
                normalizarTexto(registro.categoria) === normalizarTexto(categoria)
            );

            if (mascotasPorCategoria.length === 0) {
                return res.status(404).json({
                    mensaje: `No existen mascotas de la categoría ${categoria}.`
                });
            }

            return res.status(200).json(mascotasPorCategoria);
        }

        if (rut) {
            const mascotasDelDueno = mascotas.filter((registro) =>
                normalizarTexto(registro.rut) === normalizarTexto(rut)
            );

            if (mascotasDelDueno.length === 0) {
                return res.status(404).json({
                    mensaje: `No existen mascotas asociadas al RUT ${rut}.`
                });
            }

            return res.status(200).json(mascotasDelDueno);
        }

        return res.status(200).json(mascotas);
    }
    catch (error) {
        console.error('Error al consultar mascotas:', error);

        return res.status(500).json({
            mensaje: 'No fue posible leer la información de las mascotas.'
        });
    }
});

// POST: inserta una mascota en el archivo JSON.
app.post('/api/mascotas', async (req, res) => {
    try {
        const { nombre,categoria, rut } = req.body;

        if (!textoValido(nombre) || !textoValido(categoria) || !textoValido(rut)) {
            return res.status(400).json({
                mensaje: 'El nombre, la categoría de la mascota y el RUT del dueño son obligatorios.'
            });
        }

        const mascotas = await leerMascotas();
        const nuevaMascota = {
            nombre: nombre.trim(),
            categoria: categoria.trim(),
            rut: rut.trim()
        };

        mascotas.push(nuevaMascota);
        await guardarMascotas(mascotas);

        return res.status(201).json({
            mensaje: 'Mascota registrada correctamente.',
            mascota: nuevaMascota
        });
    }
    catch (error) {
        console.error('Error al registrar mascota:', error);

        return res.status(500).json({
            mensaje: 'No fue posible registrar la mascota.'
        });
    }
});

// DELETE ?nombre=: elimina la primera mascota que coincida con el nombre.
// DELETE ?rut=: elimina todas las mascotas asociadas al RUT.
app.delete('/api/mascotas', async (req, res) => {
    try {
        const { nombre, rut } = req.query;

        if ((!nombre && !rut) || (nombre && rut)) {
            return res.status(400).json({
                mensaje: 'Debe indicar exclusivamente el parámetro nombre o rut.'
            });
        }

        const mascotas = await leerMascotas();

        if (nombre) {
            const indice = mascotas.findIndex((registro) =>
                normalizarTexto(registro.nombre) === normalizarTexto(nombre)
            );

            if (indice === -1) {
                return res.status(404).json({
                    mensaje: `No existe una mascota con el nombre ${nombre}.`
                });
            }

            const [mascotaEliminada] = mascotas.splice(indice, 1);
            await guardarMascotas(mascotas);

            return res.status(200).json({
                mensaje: 'Mascota eliminada correctamente.',
                mascota: mascotaEliminada
            });
        }

        const mascotasEliminadas = mascotas.filter((registro) =>
            normalizarTexto(registro.rut) === normalizarTexto(rut)
        );

        if (mascotasEliminadas.length === 0) {
            return res.status(404).json({
                mensaje: `No existen mascotas asociadas al RUT ${rut}.`
            });
        }

        const mascotasRestantes = mascotas.filter((registro) =>
            normalizarTexto(registro.rut) !== normalizarTexto(rut)
        );

        await guardarMascotas(mascotasRestantes);

        return res.status(200).json({
            mensaje: `${mascotasEliminadas.length} mascota(s) eliminada(s) correctamente.`,
            mascotas: mascotasEliminadas
        });
    }
    catch (error) {
        console.error('Error al eliminar mascotas:', error);

        return res.status(500).json({
            mensaje: 'No fue posible eliminar la información solicitada.'
        });
    }
});

app.all('/api/mascotas', (req, res) => {
    res.status(405).json({
        mensaje: 'Método no permitido. Utilice GET, POST o DELETE.'
    });
});

// Captura errores producidos por un JSON mal formado en el body.
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            mensaje: 'El body enviado no contiene un JSON válido.'
        });
    }

    return next(error);
});

app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            mensaje: 'Ruta de la API no encontrada.'
        });
    }

    return res.status(404).render('error', {
        titulo: 'Página no encontrada',
        codigo: 404,
        mensaje: 'La página solicitada no existe.'
    });
});

app.use((error, req, res, next) => {
    console.error('Error no controlado:', error);

    if (req.path.startsWith('/api/')) {
        return res.status(500).json({
            mensaje: 'Error interno del servidor.'
        });
    }

    return res.status(500).render('error', {
        titulo: 'Error del servidor',
        codigo: 500,
        mensaje: 'Ocurrió un error interno en el servidor.'
    });
});

app.listen(puerto, () => {
    console.log(`Servidor funcionando en http://localhost:${puerto}`);
});
