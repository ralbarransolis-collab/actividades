require("dotenv").config();

const express = require("express");
const path = require("path");

const sequelize = require("./data/db");
const Cliente = require("./models/Cliente");

const app = express();

const puerto = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/clientes", async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            order: [
                ["id", "ASC"]
            ]
        });
        res.json(clientes);
    } catch (error) {
        console.error(
            "Error al obtener clientes:",
            error.message
        );
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los clientes"
        });
    }
});
app.post("/clientes", async (req, res) => {
    try {
        const nombre = req.body.nombre?.trim();
        const email = req.body.email?.trim();
        if (!nombre) {
            return res.status(400).json({
                ok: false,
                mensaje: "Debe ingresar el nombre"
            });
        }
        if (!email) {
            return res.status(400).json({
                ok: false,
                mensaje: "Debe ingresar el email"
            });
        }
        const clienteCreado = await Cliente.create({
            nombre,
            email
        });

        res.status(201).json({
            ok: true,
            mensaje: "Cliente creado correctamente",
            cliente: clienteCreado
        });

    } catch (error) {
        console.error(
            "Error al crear cliente:",
            error.message
        );

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                ok: false,
                mensaje: "El email ya está registrado"
            });
        }
        res.status(500).json({
            ok: false,
            mensaje: "Error al crear el cliente"
        });
    }
});

async function iniciarServidor() {
    try {
        await sequelize.authenticate();
        console.log(
            "Conexión a PostgreSQL correcta"
        );
        await sequelize.sync();
        console.log(
            "Base de datos sincronizada"
        );
        app.listen(
            puerto,
            () => {
                console.log(
                    `Servidor funcionando en http://localhost:${puerto}`
                );
            }
        );
    } catch (error) {
        console.error(
            "Error al iniciar el servidor:",
            error.message
        );
    }
}

iniciarServidor();
