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

function enteroValido(valor) {
    if (valor === undefined || valor === null || valor === "") {
        return false;
    }

    const numero = Number(valor);
    return Number.isInteger(numero) && numero >= 0;
}

function responderError(res, estado, mensaje) {
    return res.status(estado).json({ mensaje });
}

app.get("/", (req, res) => {
    res.render("index", {
        titulo: "Consultas parametrizadas II"
    });
});

// GET /clientes
// GET /clientes?rut=<rut>
// GET /clientes?edad=<n>
// GET /clientes?edadMin=<n>&edadMax=<m>
// GET /clientes?nombre=<texto>
app.get("/clientes", async (req, res) => {
    try {
        const {
            rut,
            edad,
            edadMin,
            edadMax,
            nombre
        } = req.query;

        const usaRut = textoValido(rut);
        const usaEdad = edad !== undefined;
        const usaRango = edadMin !== undefined || edadMax !== undefined;
        const usaNombre = textoValido(nombre);

        const cantidadCriterios = [
            usaRut,
            usaEdad,
            usaRango,
            usaNombre
        ].filter(Boolean).length;

        if (cantidadCriterios > 1) {
            return responderError(
                res,
                400,
                "Utilice solamente un criterio de búsqueda a la vez."
            );
        }

        let consulta;

        if (usaRut) {
            consulta = {
                text: `
                    SELECT rut, nombre, edad
                    FROM clientes
                    WHERE rut = $1
                `,
                values: [rut.trim()]
            };
        }
        else if (usaEdad) {
            if (!enteroValido(edad)) {
                return responderError(
                    res,
                    400,
                    "La edad debe ser un número entero mayor o igual a 0."
                );
            }

            consulta = {
                text: `
                    SELECT rut, nombre, edad
                    FROM clientes
                    WHERE edad = $1
                    ORDER BY nombre
                `,
                values: [Number(edad)]
            };
        }
        else if (usaRango) {
            if (!enteroValido(edadMin) || !enteroValido(edadMax)) {
                return responderError(
                    res,
                    400,
                    "Debe ingresar edadMin y edadMax como números enteros válidos."
                );
            }

            const minimo = Number(edadMin);
            const maximo = Number(edadMax);

            if (minimo > maximo) {
                return responderError(
                    res,
                    400,
                    "edadMin no puede ser mayor que edadMax."
                );
            }

            consulta = {
                text: `
                    SELECT rut, nombre, edad
                    FROM clientes
                    WHERE edad BETWEEN $1 AND $2
                    ORDER BY edad, nombre
                `,
                values: [minimo, maximo]
            };
        }
        else if (usaNombre) {
            consulta = {
                text: `
                    SELECT rut, nombre, edad
                    FROM clientes
                    WHERE nombre ILIKE $1
                    ORDER BY nombre
                `,
                values: [`${nombre.trim()}%`]
            };
        }
        else {
            consulta = {
                text: `
                    SELECT rut, nombre, edad
                    FROM clientes
                    ORDER BY nombre
                `,
                values: []
            };
        }

        const resultado = await pool.query(consulta);

        if (resultado.rowCount === 0) {
            const mensaje = usaRut
                ? "Cliente no existe."
                : "No hay clientes que cumplan con el criterio.";

            return responderError(res, 404, mensaje);
        }

        return res.status(200).json(resultado.rows);
    }
    catch (error) {
        console.error("Error al consultar clientes:", error.message);

        return responderError(
            res,
            500,
            "No fue posible consultar los clientes."
        );
    }
});

// POST /clientes
app.post("/clientes", async (req, res) => {
    try {
        const { rut, nombre, edad } = req.body;

        if (!textoValido(rut) || !textoValido(nombre)) {
            return responderError(
                res,
                400,
                "El RUT y el nombre son obligatorios."
            );
        }

        if (!enteroValido(edad)) {
            return responderError(
                res,
                400,
                "La edad debe ser un número entero mayor o igual a 0."
            );
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
        if (error.code === "23505") {
            return responderError(
                res,
                409,
                "Ya existe un cliente con ese RUT."
            );
        }

        console.error("Error al crear cliente:", error.message);

        return responderError(
            res,
            500,
            "No fue posible crear el cliente."
        );
    }
});

// PUT /clientes/:rut — solo modifica nombre
app.put("/clientes/:rut", async (req, res) => {
    try {
        const { rut } = req.params;
        const { nombre } = req.body;

        if (!textoValido(rut) || !textoValido(nombre)) {
            return responderError(
                res,
                400,
                "El RUT y el nuevo nombre son obligatorios."
            );
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
            return responderError(
                res,
                404,
                "Cliente no existe."
            );
        }

        return res.status(200).json({
            mensaje: "Nombre modificado correctamente.",
            cliente: resultado.rows[0]
        });
    }
    catch (error) {
        console.error("Error al modificar cliente:", error.message);

        return responderError(
            res,
            500,
            "No fue posible modificar el cliente."
        );
    }
});

// DELETE /clientes/:rut
app.delete("/clientes/:rut", async (req, res) => {
    try {
        const { rut } = req.params;

        if (!textoValido(rut)) {
            return responderError(
                res,
                400,
                "Debe indicar un RUT válido."
            );
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
            return responderError(
                res,
                404,
                "Cliente no existe."
            );
        }

        return res.status(200).json({
            mensaje: "Cliente eliminado correctamente.",
            cliente: resultado.rows[0]
        });
    }
    catch (error) {
        console.error("Error al eliminar cliente:", error.message);

        return responderError(
            res,
            500,
            "No fue posible eliminar el cliente."
        );
    }
});

// DELETE /clientes?edad=<n>
// DELETE /clientes?edadMin=<n>&edadMax=<m>
app.delete("/clientes", async (req, res) => {
    try {
        const { edad, edadMin, edadMax } = req.query;

        const usaEdad = edad !== undefined;
        const usaRango = edadMin !== undefined || edadMax !== undefined;

        if ((!usaEdad && !usaRango) || (usaEdad && usaRango)) {
            return responderError(
                res,
                400,
                "Debe eliminar por edad o por rango de edad, pero no por ambos."
            );
        }

        let consulta;

        if (usaEdad) {
            if (!enteroValido(edad)) {
                return responderError(
                    res,
                    400,
                    "La edad debe ser un número entero mayor o igual a 0."
                );
            }

            consulta = {
                text: `
                    DELETE FROM clientes
                    WHERE edad = $1
                    RETURNING rut, nombre, edad
                `,
                values: [Number(edad)]
            };
        }
        else {
            if (!enteroValido(edadMin) || !enteroValido(edadMax)) {
                return responderError(
                    res,
                    400,
                    "Debe ingresar edadMin y edadMax como números enteros válidos."
                );
            }

            const minimo = Number(edadMin);
            const maximo = Number(edadMax);

            if (minimo > maximo) {
                return responderError(
                    res,
                    400,
                    "edadMin no puede ser mayor que edadMax."
                );
            }

            consulta = {
                text: `
                    DELETE FROM clientes
                    WHERE edad BETWEEN $1 AND $2
                    RETURNING rut, nombre, edad
                `,
                values: [minimo, maximo]
            };
        }

        const resultado = await pool.query(consulta);

        if (resultado.rowCount === 0) {
            return responderError(
                res,
                404,
                "No hay clientes que cumplan con el criterio."
            );
        }

        const clientesOrdenados = resultado.rows.sort((a, b) =>
            a.nombre.localeCompare(b.nombre, "es")
        );

        return res.status(200).json({
            mensaje: `${resultado.rowCount} cliente(s) eliminado(s).`,
            nombresEliminados: clientesOrdenados.map(
                (cliente) => cliente.nombre
            ),
            clientes: clientesOrdenados
        });
    }
    catch (error) {
        console.error(
            "Error al eliminar clientes por criterio:",
            error.message
        );

        return responderError(
            res,
            500,
            "No fue posible eliminar los clientes."
        );
    }
});

app.all("/clientes", (req, res) => {
    return responderError(
        res,
        405,
        "Método no permitido para /clientes."
    );
});

app.all("/clientes/:rut", (req, res) => {
    return responderError(
        res,
        405,
        "Método no permitido para /clientes/:rut."
    );
});

app.use((req, res) => {
    if (req.path.startsWith("/clientes")) {
        return responderError(
            res,
            404,
            "Ruta del servicio no encontrada."
        );
    }

    return res.status(404).render("error", {
        titulo: "Página no encontrada",
        codigo: 404,
        mensaje: "La página solicitada no existe."
    });
});

app.use((error, req, res, next) => {
    console.error("Error no controlado:", error);

    if (req.path.startsWith("/clientes")) {
        return responderError(
            res,
            500,
            "Error interno del servidor."
        );
    }

    return res.status(500).render("error", {
        titulo: "Error del servidor",
        codigo: 500,
        mensaje: "Ocurrió un error interno en el servidor."
    });
});

app.listen(PORT, () => {
    console.log(
        `Servidor funcionando en http://localhost:${PORT}`
    );
});
