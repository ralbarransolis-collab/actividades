require("dotenv").config();

const express = require("express");
const path = require("path");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

function textoValido(valor) {
    return typeof valor === "string" && valor.trim() !== "";
}

function edadValida(edad) {
    const edadNumero = Number(edad);
    return Number.isInteger(edadNumero) && edadNumero >= 0;
}

// Vista principal del frontend.
app.get("/", (req, res) => {
    res.render("index", {
        titulo: "CRUD de clientes"
    });
});

// GET /clientes: retorna todos los clientes ordenados.
app.get("/clientes", async (req, res) => {
    try {
        const consulta = {
            text: `
                SELECT rut, nombre, edad
                FROM clientes
                ORDER BY nombre, rut
            `,
            values: []
        };

        const resultado = await pool.query(consulta);

        return res.status(200).json(resultado.rows);
    }
    catch (error) {
        console.error("Error al consultar clientes:", error.message);

        return res.status(500).json({
            mensaje: "No fue posible consultar los clientes."
        });
    }
});

// POST /clientes: crea un cliente.
app.post("/clientes", async (req, res) => {
    try {
        const { rut, nombre, edad } = req.body;

        if (!textoValido(rut) || !textoValido(nombre) || edad === undefined) {
            return res.status(400).json({
                mensaje: "El RUT, el nombre y la edad son obligatorios."
            });
        }

        if (!edadValida(edad)) {
            return res.status(400).json({
                mensaje: "La edad debe ser un número entero mayor o igual a 0."
            });
        }

        const consulta = {
            text: `
                INSERT INTO clientes (rut, nombre, edad)
                VALUES ($1, $2, $3)
                RETURNING rut, nombre, edad
            `,
            values: [
                rut.trim(),
                nombre.trim(),
                Number(edad)
            ]
        };

        const resultado = await pool.query(consulta);

        return res.status(201).json({
            mensaje: "Cliente creado correctamente.",
            cliente: resultado.rows[0]
        });
    }
    catch (error) {
        console.error("Error al crear cliente:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                mensaje: "Ya existe un cliente registrado con ese RUT."
            });
        }

        return res.status(500).json({
            mensaje: "No fue posible crear el cliente."
        });
    }
});

// PUT /clientes/:rut: modifica únicamente el nombre.
app.put("/clientes/:rut", async (req, res) => {
    try {
        const rut = req.params.rut;
        const { nombre } = req.body;
        const camposRecibidos = Object.keys(req.body);

        if (
            camposRecibidos.length !== 1 ||
            camposRecibidos[0] !== "nombre"
        ) {
            return res.status(400).json({
                mensaje: "Solo está permitido modificar el campo nombre."
            });
        }

        if (!textoValido(rut) || !textoValido(nombre)) {
            return res.status(400).json({
                mensaje: "Debe indicar un RUT y un nombre válidos."
            });
        }

        const consulta = {
            text: `
                UPDATE clientes
                SET nombre = $1
                WHERE rut = $2
                RETURNING rut, nombre, edad
            `,
            values: [nombre.trim(), rut.trim()]
        };

        const resultado = await pool.query(consulta);

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensaje: "No existe un cliente con el RUT indicado."
            });
        }

        return res.status(200).json({
            mensaje: "Nombre del cliente modificado correctamente.",
            cliente: resultado.rows[0]
        });
    }
    catch (error) {
        console.error("Error al modificar cliente:", error.message);

        return res.status(500).json({
            mensaje: "No fue posible modificar el cliente."
        });
    }
});

// DELETE /clientes/:rut: elimina un cliente por RUT.
app.delete("/clientes/:rut", async (req, res) => {
    try {
        const rut = req.params.rut;

        if (!textoValido(rut)) {
            return res.status(400).json({
                mensaje: "Debe indicar un RUT válido."
            });
        }

        const consulta = {
            text: `
                DELETE FROM clientes
                WHERE rut = $1
                RETURNING rut, nombre, edad
            `,
            values: [rut.trim()]
        };

        const resultado = await pool.query(consulta);

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensaje: "No existe un cliente con el RUT indicado."
            });
        }

        return res.status(200).json({
            mensaje: "Cliente eliminado correctamente.",
            cliente: resultado.rows[0]
        });
    }
    catch (error) {
        console.error("Error al eliminar cliente:", error.message);

        return res.status(500).json({
            mensaje: "No fue posible eliminar el cliente."
        });
    }
});

// Métodos no permitidos para las rutas del recurso clientes.
app.all("/clientes", (req, res) => {
    return res.status(405).json({
        mensaje: "Método no permitido. Utilice GET o POST."
    });
});

app.all("/clientes/:rut", (req, res) => {
    return res.status(405).json({
        mensaje: "Método no permitido. Utilice PUT o DELETE."
    });
});

// Captura errores de JSON mal formado.
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            mensaje: "El body enviado no contiene un JSON válido."
        });
    }

    return next(error);
});

app.use((req, res) => {
    if (req.accepts("html")) {
        return res.status(404).render("error", {
            titulo: "Página no encontrada",
            codigo: 404,
            mensaje: "La página solicitada no existe."
        });
    }

    return res.status(404).json({
        mensaje: "Ruta no encontrada."
    });
});

app.use((error, req, res, next) => {
    console.error("Error no controlado:", error);

    if (req.accepts("html")) {
        return res.status(500).render("error", {
            titulo: "Error del servidor",
            codigo: 500,
            mensaje: "Ocurrió un error interno en el servidor."
        });
    }

    return res.status(500).json({
        mensaje: "Error interno del servidor."
    });
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
