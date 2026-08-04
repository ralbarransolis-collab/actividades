require("dotenv").config();

const express = require("express");
const pool = require("./config/db");

const app = express();
const puerto = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static("public"));

// GET /conductores: retorna todos los conductores.
app.get("/conductores", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT nombre, edad
            FROM conductores
            ORDER BY nombre ASC
        `);

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error consultando conductores:", error.message);
        res.status(500).json({ error: "No fue posible consultar los conductores" });
    }
});

// GET /automoviles y /automóviles: retorna todos los automóviles.
const listarAutomoviles = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT marca, patente, nombre_conductor
            FROM automoviles
            ORDER BY marca ASC, patente ASC
        `);

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error consultando automóviles:", error.message);
        res.status(500).json({ error: "No fue posible consultar los automóviles" });
    }
};

app.get(["/automoviles", "/automóviles"], listarAutomoviles);

// GET /conductoressinauto?edad=<numero>
app.get("/conductoressinauto", async (req, res) => {
    const edad = Number(req.query.edad);

    if (!req.query.edad || !Number.isInteger(edad) || edad <= 0) {
        return res.status(400).json({
            error: "Debe enviar una edad válida. Ejemplo: /conductoressinauto?edad=40"
        });
    }

    try {
        const resultado = await pool.query(
            `
                SELECT c.nombre, c.edad
                FROM conductores AS c
                WHERE c.edad < $1
                  AND NOT EXISTS (
                      SELECT 1
                      FROM automoviles AS a
                      WHERE a.nombre_conductor = c.nombre
                  )
                ORDER BY c.edad ASC, c.nombre ASC
            `,
            [edad]
        );

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error consultando conductores sin automóvil:", error.message);
        res.status(500).json({
            error: "No fue posible consultar los conductores sin automóvil"
        });
    }
});

// GET /solitos: conductores sin automóvil y automóviles sin conductor.
app.get("/solitos", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                'conductor_sin_automovil' AS tipo,
                c.nombre AS nombre_conductor,
                c.edad,
                NULL::VARCHAR AS marca,
                NULL::VARCHAR AS patente
            FROM conductores AS c
            WHERE NOT EXISTS (
                SELECT 1
                FROM automoviles AS a
                WHERE a.nombre_conductor = c.nombre
            )

            UNION ALL

            SELECT
               'conductor_sin_edad_registrada' AS tipo,
                a.nombre_conductor,
                NULL::INTEGER AS edad,
                a.marca,
                a.patente
            FROM automoviles AS a
            WHERE NOT EXISTS (
                SELECT 1
                FROM conductores AS c
                WHERE c.nombre = a.nombre_conductor
            )

            ORDER BY tipo ASC, nombre_conductor ASC
        `);

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error consultando registros sin relación:", error.message);
        res.status(500).json({
            error: "No fue posible consultar los conductores y automóviles sin relación"
        });
    }
});

// GET /auto?patente=<string>
// GET /auto?iniciopatente=<letra>
app.get("/auto", async (req, res) => {
    const patente = req.query.patente?.trim();
    const inicioPatente = req.query.iniciopatente?.trim();

    if ((!patente && !inicioPatente) || (patente && inicioPatente)) {
        return res.status(400).json({
            error: "Debe enviar solamente patente o iniciopatente"
        });
    }

    try {
        if (patente) {
            const resultado = await pool.query(
                `
                    SELECT
                        a.marca,
                        a.patente,
                        a.nombre_conductor,
                        c.edad AS edad_conductor
                    FROM automoviles AS a
                    LEFT JOIN conductores AS c
                        ON c.nombre = a.nombre_conductor
                    WHERE UPPER(a.patente) = UPPER($1)
                `,
                [patente]
            );

            if (resultado.rowCount === 0) {
                return res.status(404).json({
                    error: `No se encontró un automóvil con la patente ${patente.toUpperCase()}`
                });
            }

            return res.status(200).json(resultado.rows[0]);
        }

        if (!/^[a-zA-Z]$/.test(inicioPatente)) {
            return res.status(400).json({
                error: "iniciopatente debe contener una sola letra"
            });
        }

        const resultado = await pool.query(
            `
                SELECT
                    a.marca,
                    a.patente,
                    a.nombre_conductor,
                    c.edad AS edad_conductor
                FROM automoviles AS a
                LEFT JOIN conductores AS c
                    ON c.nombre = a.nombre_conductor
                WHERE a.patente ILIKE $1
                ORDER BY a.patente ASC
            `,
            [`${inicioPatente}%`]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: `No se encontraron patentes que comiencen con ${inicioPatente.toUpperCase()}`
            });
        }

        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("Error consultando automóviles:", error.message);
        res.status(500).json({ error: "No fue posible realizar la búsqueda" });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

async function iniciarServidor() {
    try {
        await pool.query("SELECT 1");

        app.listen(puerto, () => {
            console.log(`Servidor funcionando en http://localhost:${puerto}`);
            console.log("Conexión con PostgreSQL realizada correctamente");
        });
    } catch (error) {
        console.error("No fue posible conectar con PostgreSQL:", error.message);
        process.exit(1);
    }
}

iniciarServidor();
