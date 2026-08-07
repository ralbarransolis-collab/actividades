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

function convertirEdad(valor) {
    const edad = Number(valor);

    if (!Number.isInteger(edad) || edad < 0 || edad > 120) {
        return null;
    }

    return edad;
}

function normalizarRut(rut) {
    return String(rut).trim().toUpperCase();
}

function parametrosNoPermitidos(query, permitidos) {
    return Object.keys(query).filter(
        (parametro) => !permitidos.includes(parametro)
    );
}

app.get("/", (req, res) => {
    res.render("index", {
        titulo: "CRUD parametrizado de clientes"
    });
});

// GET /clientes
// GET /clientes?rut=<rut>
// GET /clientes?edad=<n>
// GET /clientes?nombre=<texto>
app.get("/clientes", async (req, res) => {
    try {
        const noPermitidos = parametrosNoPermitidos(
            req.query,
            ["rut", "edad", "nombre"]
        );

        if (noPermitidos.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: `Parámetro no permitido: ${noPermitidos.join(", ")}`
            });
        }

        const { rut, edad, nombre } = req.query;
        const filtros = [rut, edad, nombre].filter(
            (valor) => valor !== undefined
        );

        if (filtros.length > 1) {
            return res.status(400).json({
                ok: false,
                mensaje: "Debe consultar utilizando un solo criterio."
            });
        }

        let consulta;
        let consultaFiltrada = false;

        if (rut !== undefined) {
            if (!textoValido(rut)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe ingresar un RUT válido."
                });
            }

            consultaFiltrada = true;
            consulta = {
                text: `
                    SELECT rut, nombre, edad
                    FROM clientes
                    WHERE rut = $1
                    ORDER BY nombre
                `,
                values: [normalizarRut(rut)]
            };
        }
        else if (edad !== undefined) {
            const edadNumero = convertirEdad(edad);

            if (edadNumero === null) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La edad debe ser un número entero entre 0 y 120."
                });
            }

            consultaFiltrada = true;
            consulta = {
                text: `
                    SELECT rut, nombre, edad
                    FROM clientes
                    WHERE edad = $1
                    ORDER BY nombre
                `,
                values: [edadNumero]
            };
        }
        else if (nombre !== undefined) {
            if (!textoValido(nombre)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe ingresar un nombre o prefijo válido."
                });
            }

            consultaFiltrada = true;
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

        if (consultaFiltrada && resultado.rowCount === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: "Cliente no existe o no hay coincidencias."
            });
        }

        return res.status(200).json({
            ok: true,
            data: resultado.rows
        });
    }
    catch (error) {
        console.error("Error al consultar clientes:", error.message);

        return res.status(500).json({
            ok: false,
            mensaje: "No fue posible consultar los clientes."
        });
    }
});

// POST /clientes
app.post("/clientes", async (req, res) => {
    try {
        const { rut, nombre, edad } = req.body;

        if (!textoValido(rut) || !textoValido(nombre)) {
            return res.status(400).json({
                ok: false,
                mensaje: "El RUT, el nombre y la edad son obligatorios."
            });
        }

        const edadNumero = convertirEdad(edad);

        if (edadNumero === null) {
            return res.status(400).json({
                ok: false,
                mensaje: "La edad debe ser un número entero entre 0 y 120."
            });
        }

        const consulta = {
            text: `
                INSERT INTO clientes (rut, nombre, edad)
                VALUES ($1, $2, $3)
                RETURNING rut, nombre, edad
            `,
            values: [
                normalizarRut(rut),
                nombre.trim(),
                edadNumero
            ]
        };

        const resultado = await pool.query(consulta);

        return res.status(201).json({
            ok: true,
            data: resultado.rows[0]
        });
    }
    catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                ok: false,
                mensaje: "El RUT ya se encuentra registrado."
            });
        }

        console.error("Error al crear cliente:", error.message);

        return res.status(500).json({
            ok: false,
            mensaje: "No fue posible crear el cliente."
        });
    }
});

// PUT /clientes/:rut — modifica solamente nombre
app.put("/clientes/:rut", async (req, res) => {
    try {
        const { rut } = req.params;
        const { nombre } = req.body;
        const camposRecibidos = Object.keys(req.body);

        if (
            camposRecibidos.some((campo) => campo !== "nombre")
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: "Esta operación permite modificar únicamente el nombre."
            });
        }

        if (!textoValido(rut) || !textoValido(nombre)) {
            return res.status(400).json({
                ok: false,
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
            values: [
                nombre.trim(),
                normalizarRut(rut)
            ]
        };

        const resultado = await pool.query(consulta);

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: "Cliente no existe."
            });
        }

        return res.status(200).json({
            ok: true,
            rowCount: resultado.rowCount,
            mensaje: "Actualizado correctamente",
            data: resultado.rows[0]
        });
    }
    catch (error) {
        console.error("Error al actualizar cliente:", error.message);

        return res.status(500).json({
            ok: false,
            mensaje: "No fue posible actualizar el cliente."
        });
    }
});

// DELETE /clientes?rut=<rut>
// DELETE /clientes?nombre=<texto>
// DELETE /clientes?edad=<n>
app.delete("/clientes", async (req, res) => {
    try {
        const noPermitidos = parametrosNoPermitidos(
            req.query,
            ["rut", "nombre", "edad"]
        );

        if (noPermitidos.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: `Parámetro no permitido: ${noPermitidos.join(", ")}`
            });
        }

        const { rut, nombre, edad } = req.query;
        const criterios = [rut, nombre, edad].filter(
            (valor) => valor !== undefined
        );

        if (criterios.length !== 1) {
            return res.status(400).json({
                ok: false,
                mensaje: "Debe eliminar utilizando un solo criterio: rut, nombre o edad."
            });
        }

        if (rut !== undefined) {
            if (!textoValido(rut)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe ingresar un RUT válido."
                });
            }

            const eliminarPorRut = {
                text: `
                    DELETE FROM clientes
                    WHERE rut = $1
                    RETURNING rut, nombre, edad
                `,
                values: [normalizarRut(rut)]
            };

            const resultado = await pool.query(eliminarPorRut);

            if (resultado.rowCount === 0) {
                return res.status(404).json({
                    ok: false,
                    mensaje: "Cliente no existe."
                });
            }

            return res.status(200).json({
                ok: true,
                rowCount: resultado.rowCount,
                mensaje: "Eliminado correctamente",
                data: resultado.rows[0]
            });
        }

        let consultaCoincidencias;

        if (nombre !== undefined) {
            if (!textoValido(nombre)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe ingresar un nombre o prefijo válido."
                });
            }

            consultaCoincidencias = {
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
            const edadNumero = convertirEdad(edad);

            if (edadNumero === null) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "La edad debe ser un número entero entre 0 y 120."
                });
            }

            consultaCoincidencias = {
                text: `
                    SELECT rut, nombre, edad
                    FROM clientes
                    WHERE edad = $1
                    ORDER BY nombre
                `,
                values: [edadNumero]
            };
        }

        const coincidencias = await pool.query(
            consultaCoincidencias
        );

        if (coincidencias.rowCount === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: "No existen clientes que cumplan con el criterio."
            });
        }

        if (coincidencias.rowCount > 1) {
            return res.status(400).json({
                ok: false,
                mensaje: `El criterio coincide con ${coincidencias.rowCount} clientes. Refine el criterio para evitar una eliminación masiva.`,
                data: coincidencias.rows
            });
        }

        const cliente = coincidencias.rows[0];
        const eliminarUnico = {
            text: `
                DELETE FROM clientes
                WHERE rut = $1
                RETURNING rut, nombre, edad
            `,
            values: [cliente.rut]
        };

        const eliminado = await pool.query(eliminarUnico);

        return res.status(200).json({
            ok: true,
            rowCount: eliminado.rowCount,
            mensaje: "Eliminado correctamente",
            data: eliminado.rows[0]
        });
    }
    catch (error) {
        console.error("Error al eliminar cliente:", error.message);

        return res.status(500).json({
            ok: false,
            mensaje: "No fue posible eliminar el cliente."
        });
    }
});

app.all("/clientes", (req, res) => {
    return res.status(405).json({
        ok: false,
        mensaje: "Método no permitido para /clientes."
    });
});

app.all("/clientes/:rut", (req, res) => {
    return res.status(405).json({
        ok: false,
        mensaje: "Método no permitido para /clientes/:rut."
    });
});

app.use((error, req, res, next) => {
    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            ok: false,
            mensaje: "El body enviado no contiene un JSON válido."
        });
    }

    return next(error);
});

app.use((req, res) => {
    if (req.path.startsWith("/clientes")) {
        return res.status(404).json({
            ok: false,
            mensaje: "Ruta no encontrada."
        });
    }

    return res.status(404).render("error", {
        titulo: "Página no encontrada",
        codigo: 404,
        mensaje: "La página solicitada no existe."
    });
});

app.listen(PORT, () => {
    console.log(
        `Servidor funcionando en http://localhost:${PORT}`
    );
});
