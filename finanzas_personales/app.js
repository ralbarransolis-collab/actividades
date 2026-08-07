require("dotenv").config();

const express = require("express");
const path = require("path");
const pool = require("./config/db");
const poolConnectionString = require(
    "./config/dbConnectionString"
);

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT
                nombre,
                me_debe,
                cuotas_cobrar,
                le_debo,
                cuotas_pagar
            FROM finanzas_personales
            ORDER BY nombre`
        )
        res.render("finanzas_personales", {
            finanzas_personales: resultado.rows,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });
    }
    catch (error) {
        console.error(
            "Error al consultas las finanzas personles", error
        );

        res.status(500).send(
            "Ocurrio un error al consultar las finanzas personales"
        )

    }
});

app.get("/clientes", (req, res) => {
    res.render("clientes", {
        titulo: "Clientes"
    });
});

app.get("/api/clientes", async (req, res) => {
    try {
        const consulta = {
            text: `
                SELECT
                    id,
                    nombre,
                    correo,
                    telefono,
                    ciudad
                FROM clientes
                ORDER BY id
            `,
            values: []
        };

        const resultado =
            await poolConnectionString.query(consulta);

        return res.status(200).json(
            resultado.rows
        );
    }
    catch (error) {
        console.error(
            "Error al consultar los clientes:",
            error.message
        );

        return res.status(500).json({
            mensaje:
                "No fue posible consultar los clientes"
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `Servidor funcionando en http://localhost:${PORT}`
    );
});