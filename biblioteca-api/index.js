const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const puerto = 3000;
const rutaCatalogo = path.join(__dirname, "catalogo.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function leerCatalogo() {
    try {
        const contenido = await fs.readFile(rutaCatalogo, "utf-8");
        return JSON.parse(contenido);
    } catch (error) {
        if (error.code === "ENOENT") {
            await fs.writeFile(rutaCatalogo, "[]");
            return [];
        }
        throw error;
    }
}

async function guardarCatalogo(libros) {
    await fs.writeFile(
        rutaCatalogo,
        JSON.stringify(libros, null, 2)
    );
}

app.get("/libros", async (req, res) => {
    try {
        const libros = await leerCatalogo();

        res.status(200).json({
            ok: true,
            data: libros
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al leer el catálogo"
        });
    }
});

app.post("/libros", async (req, res) => {
    const titulo = req.body.titulo?.trim();
    const autor = req.body.autor?.trim();
    const anio = Number(req.body.anio);

    if (!titulo || !autor || !Number.isInteger(anio)) {
        return res.status(400).json({
            ok: false,
            mensaje: "Datos inválidos"
        });
    }

    try {
        const libros = await leerCatalogo();

        const nuevoId =
            Math.max(0, ...libros.map(libro => libro.id)) + 1;

        const nuevoLibro = {
            id: nuevoId,
            titulo,
            autor,
            anio
        };

        libros.push(nuevoLibro);

        await guardarCatalogo(libros);

        res.status(201).json({
            ok: true,
            data: nuevoLibro
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al crear el libro"
        });
    }
});

app.put("/libros/:id", async (req, res) => {
    const id = Number(req.params.id);
    const titulo = req.body.titulo?.trim();
    const autor = req.body.autor?.trim();
    const anio = Number(req.body.anio);

    if (!Number.isInteger(id) ||
        !titulo ||
        !autor ||
        !Number.isInteger(anio)) {

        return res.status(400).json({
            ok: false,
            mensaje: "Datos inválidos"
        });
    }

    try {
        const libros = await leerCatalogo();

        const indice = libros.findIndex(
            libro => libro.id === id
        );

        if (indice === -1) {
            return res.status(404).json({
                ok: false,
                mensaje: "Libro no encontrado"
            });
        }

        libros[indice] = {
            id,
            titulo,
            autor,
            anio
        };

        await guardarCatalogo(libros);

        res.status(200).json({
            ok: true,
            data: libros[indice]
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al actualizar el libro"
        });
    }
});

app.delete("/libros/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            ok: false,
            mensaje: "ID inválido"
        });
    }

    try {
        const libros = await leerCatalogo();

        const indice = libros.findIndex(
            libro => libro.id === id
        );

        if (indice === -1) {
            return res.status(404).json({
                ok: false,
                mensaje: "Libro no encontrado"
            });
        }

        const eliminado = libros.splice(indice, 1)[0];

        await guardarCatalogo(libros);

        res.status(200).json({
            ok: true,
            data: eliminado
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar el libro"
        });
    }
});


app.listen(puerto, () => {
    console.log(
        `API funcionando en http://localhost:${puerto}`
    );
});