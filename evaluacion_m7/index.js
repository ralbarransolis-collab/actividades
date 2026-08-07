require("dotenv").config();

const express = require("express");
const path = require("path");
const Cursor = require("pg-cursor");
const pool = require("./data/db");

const app = express();
const puerto = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const leerCursor = (cursor, cantidad) =>
    new Promise((resolve, reject) => {
        cursor.read(cantidad, (error, filas) => {
            if (error) reject(error);
            else resolve(filas);
        });
    });

const cerrarCursor = cursor =>
    new Promise((resolve, reject) => {
        cursor.close(error => {
            if (error) reject(error);
            else resolve();
        });
    });

app.get("/paises", async (req, res) => {
    const cantidad = Number(req.query.cantidad || 5);
    const pagina = Number(req.query.pagina || 1);

    if (![5, 10, 20].includes(cantidad)) {
        return res.status(400).json({
            ok: false,
            mensaje: "La cantidad debe ser 5, 10 o 20"
        });
    }

    if (!Number.isInteger(pagina) || pagina < 1) {
        return res.status(400).json({
            ok: false,
            mensaje: "La página no es válida"
        });
    }

    let conexion;
    let cursor;

    try {
        conexion = await pool.connect();

        cursor = conexion.query(new Cursor(`
            SELECT
                p.nombre,
                p.continente,
                p.poblacion,
                pp.pib_2019,
                pp.pib_2020
            FROM paises AS p
            INNER JOIN paises_pib AS pp
                ON p.nombre = pp.nombre
            ORDER BY p.nombre
        `));

        const saltar = (pagina - 1) * cantidad;

        if (saltar > 0) {
            await leerCursor(cursor, saltar);
        }

        const filas = await leerCursor(cursor, cantidad + 1);
        const hayMas = filas.length > cantidad;

        res.json({
            ok: true,
            pagina,
            cantidad,
            hayMas,
            paises: filas.slice(0, cantidad)
        });

    } catch (error) {
        console.error("Error GET /paises:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los países"
        });

    } finally {
        if (cursor) {
            await cerrarCursor(cursor).catch(() => {});
        }
        if (conexion) conexion.release();
    }
});

app.post("/paises", async (req, res) => {
    const nombre = req.body.nombre?.trim();
    const continente = req.body.continente?.trim();
    const poblacion = Number(req.body.poblacion);
    const pib2019 = Number(req.body.pib_2019);
    const pib2020 = Number(req.body.pib_2020);

    if (!nombre || !continente) {
        return res.status(400).json({
            ok: false,
            mensaje: "Nombre y continente son obligatorios"
        });
    }

    if (![poblacion, pib2019, pib2020].every(Number.isInteger)) {
        return res.status(400).json({
            ok: false,
            mensaje: "Población y PIB deben ser números enteros"
        });
    }

    if (poblacion < 0 || pib2019 < 0 || pib2020 < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Población y PIB no pueden ser negativos"
        });
    }

    let conexion;

    try {
        conexion = await pool.connect();
        await conexion.query("BEGIN");

        await conexion.query({
            text: `
                INSERT INTO paises (nombre, continente, poblacion)
                VALUES ($1, $2, $3)
            `,
            values: [nombre, continente, poblacion]
        });

        await conexion.query({
            text: `
                INSERT INTO paises_pib (nombre, pib_2019, pib_2020)
                VALUES ($1, $2, $3)
            `,
            values: [nombre, pib2019, pib2020]
        });

        await conexion.query({
            text: `
                INSERT INTO paises_data_web (nombre_pais, accion)
                VALUES ($1, 1)
            `,
            values: [nombre]
        });

        await conexion.query("COMMIT");

        res.status(201).json({
            ok: true,
            mensaje: `País "${nombre}" agregado correctamente`
        });

    } catch (error) {
        if (conexion) await conexion.query("ROLLBACK").catch(() => {});

        console.error("Error POST /paises:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                ok: false,
                mensaje:
                    "No se pudo agregar el país porque ya existe un registro con ese nombre. Se realizó ROLLBACK."
            });
        }

        res.status(500).json({
            ok: false,
            mensaje:
                "No se pudo agregar el país. La transacción fue revertida."
        });

    } finally {
        if (conexion) conexion.release();
    }
});

async function eliminarPais(req, res) {
    const nombre = (req.params.nombre || req.query.nombre || "").trim();

    if (!nombre) {
        return res.status(400).json({
            ok: false,
            mensaje: "Debe indicar el nombre del país"
        });
    }

    let conexion;

    try {
        conexion = await pool.connect();
        await conexion.query("BEGIN");

        const existe = await conexion.query({
            text: "SELECT nombre FROM paises WHERE nombre = $1",
            values: [nombre]
        });

        if (existe.rowCount === 0) {
            const error = new Error("El país no existe");
            error.status = 404;
            throw error;
        }

      await conexion.query({
            text: "DELETE FROM paises_pib WHERE nombre = $1",
            values: [nombre]
        });

        await conexion.query({
            text: "DELETE FROM paises WHERE nombre = $1",
            values: [nombre]
        });

        await conexion.query({
            text: `
                INSERT INTO paises_data_web (nombre_pais, accion)
                VALUES ($1, 0)
            `,
            values: [nombre]
        });

        await conexion.query("COMMIT");

        res.json({
            ok: true,
            mensaje: `País "${nombre}" eliminado correctamente`
        });

    } catch (error) {
        if (conexion) await conexion.query("ROLLBACK").catch(() => {});

        console.error("Error DELETE /paises:", error.message);

        if (error.status === 404) {
            return res.status(404).json({
                ok: false,
                mensaje: error.message
            });
        }

        if (error.code === "23505") {
            return res.status(409).json({
                ok: false,
                mensaje:
                    "No se pudo registrar la eliminación en paises_data_web porque ese país ya posee un registro. Se realizó ROLLBACK y el país no fue eliminado."
            });
        }

        res.status(500).json({
            ok: false,
            mensaje:
                "No se pudo eliminar el país. La transacción fue revertida."
        });

    } finally {
        if (conexion) conexion.release();
    }
}

app.delete("/paises", eliminarPais);
app.delete("/paises/:nombre", eliminarPais);

app.listen(puerto, () => {
    console.log(`Servidor funcionando en http://localhost:${puerto}`);
});
