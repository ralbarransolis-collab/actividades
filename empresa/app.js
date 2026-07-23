require("dotenv").config();

const express = require("express");
const path = require("path");
const pool = require("./config/db");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* =====================================================
   EMPLEADOS
===================================================== */

// Mostrar empleados
app.get("/", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM empleados ORDER BY id"
        );

        res.render("empleados", {
            empleados: resultado.rows,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });

    } catch (error) {
        console.error(
            "Error al consultar los empleados:",
            error.message
        );

        res.status(500).send(
            "Ocurrió un error al consultar los empleados"
        );
    }
});

// Registrar empleado
app.post("/empleados", async (req, res) => {
    try {
        const { nombre, cargo, sueldo } = req.body;

        if (
            !nombre ||
            !nombre.trim() ||
            !cargo ||
            !cargo.trim() ||
            !sueldo
        ) {
            return res.redirect(
                "/?error=Todos los campos son obligatorios"
            );
        }

        const sueldoNumero = Number(sueldo);

        if (
            !Number.isInteger(sueldoNumero) ||
            sueldoNumero <= 0
        ) {
            return res.redirect(
                "/?error=El sueldo debe ser un número entero superior a 0"
            );
        }

        await pool.query(
            `INSERT INTO empleados (nombre, cargo, sueldo)
             VALUES ($1, $2, $3)`,
            [
                nombre.trim(),
                cargo.trim(),
                sueldoNumero
            ]
        );

        res.redirect(
            "/?mensaje=Empleado registrado correctamente"
        );

    } catch (error) {
        console.error(
            "Error al registrar el empleado:",
            error.message
        );

        res.redirect(
            "/?error=No fue posible registrar el empleado"
        );
    }
});

// Mostrar formulario para editar empleado
app.get("/empleados/editar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM empleados WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send(
                "Empleado no encontrado"
            );
        }

        res.render("editar-empleado", {
            empleado: resultado.rows[0],
            error: null
        });

    } catch (error) {
        console.error(
            "Error al buscar el empleado:",
            error.message
        );

        res.status(500).send(
            "Ocurrió un error al buscar al empleado"
        );
    }
});

// Actualizar empleado
app.post("/empleados/actualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cargo, sueldo } = req.body;

        if (
            !nombre ||
            !nombre.trim() ||
            !cargo ||
            !cargo.trim() ||
            !sueldo
        ) {
            return res.status(400).send(
                "Todos los campos son requeridos"
            );
        }

        const sueldoNumero = Number(sueldo);

        if (
            !Number.isInteger(sueldoNumero) ||
            sueldoNumero <= 0
        ) {
            return res.status(400).send(
                "El sueldo debe ser un número entero mayor a 0"
            );
        }

        const resultado = await pool.query(
            `UPDATE empleados
             SET nombre = $1,
                 cargo = $2,
                 sueldo = $3
             WHERE id = $4`,
            [
                nombre.trim(),
                cargo.trim(),
                sueldoNumero,
                id
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).send(
                "Empleado no encontrado"
            );
        }

        res.redirect(
            "/?mensaje=Empleado actualizado correctamente"
        );

    } catch (error) {
        console.error(
            "Error al actualizar al empleado:",
            error.message
        );

        res.status(500).send(
            "Ocurrió un error al intentar actualizar al empleado"
        );
    }
});

// Eliminar empleado
app.post("/empleados/eliminar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM empleados
             WHERE id = $1`,
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).send(
                "Empleado no encontrado"
            );
        }

        res.redirect(
            "/?mensaje=Empleado eliminado correctamente"
        );

    } catch (error) {
        console.error(
            "Error al eliminar al empleado:",
            error.message
        );

        res.status(500).send(
            "Ocurrió un error al intentar eliminar al empleado"
        );
    }
});

/* =====================================================
   PROVEEDORES
===================================================== */

// Mostrar proveedores
app.get("/proveedores", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT * FROM proveedores ORDER BY id"
        );

        res.render("proveedores", {
            proveedores: resultado.rows,
            mensaje: req.query.mensaje || null,
            error: req.query.error || null
        });

    } catch (error) {
        console.error(
            "Error al consultar los proveedores:",
            error.message
        );

        res.status(500).send(
            "Ocurrió un error al consultar los proveedores"
        );
    }
});

// Registrar proveedor
app.post("/proveedores", async (req, res) => {
    try {
        const {
            nombre,
            direccion,
            telefono,
            email
        } = req.body;

        if (
            !nombre ||
            !nombre.trim() ||
            !direccion ||
            !direccion.trim() ||
            !telefono ||
            !telefono.trim() ||
            !email ||
            !email.trim()
        ) {
            return res.redirect(
                "/proveedores?error=Todos los campos son obligatorios"
            );
        }

        await pool.query(
            `INSERT INTO proveedores
                (nombre, direccion, telefono, email)
             VALUES ($1, $2, $3, $4)`,
            [
                nombre.trim(),
                direccion.trim(),
                telefono.trim(),
                email.trim()
            ]
        );

        res.redirect(
            "/proveedores?mensaje=Proveedor registrado correctamente"
        );

    } catch (error) {
        console.error(
            "Error al registrar el proveedor:",
            error.message
        );

        res.redirect(
            "/proveedores?error=No fue posible registrar el proveedor"
        );
    }
});

// Mostrar formulario para editar proveedor
app.get("/proveedores/editar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM proveedores WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send(
                "Proveedor no encontrado"
            );
        }

        res.render("editar-proveedor", {
            proveedor: resultado.rows[0],
            error: null
        });

    } catch (error) {
        console.error(
            "Error al buscar el proveedor:",
            error.message
        );

        res.status(500).send(
            "Ocurrió un error al buscar al proveedor"
        );
    }
});

// Actualizar proveedor
app.post("/proveedores/actualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            direccion,
            telefono,
            email
        } = req.body;

        if (
            !nombre ||
            !nombre.trim() ||
            !direccion ||
            !direccion.trim() ||
            !telefono ||
            !telefono.trim() ||
            !email ||
            !email.trim()
        ) {
            return res.status(400).send(
                "Todos los campos son requeridos"
            );
        }

        const resultado = await pool.query(
            `UPDATE proveedores
             SET nombre = $1,
                 direccion = $2,
                 telefono = $3,
                 email = $4
             WHERE id = $5`,
            [
                nombre.trim(),
                direccion.trim(),
                telefono.trim(),
                email.trim(),
                id
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).send(
                "Proveedor no encontrado"
            );
        }

        res.redirect(
            "/proveedores?mensaje=Proveedor actualizado correctamente"
        );

    } catch (error) {
        console.error(
            "Error al actualizar al proveedor:",
            error.message
        );

        res.status(500).send(
            "Ocurrió un error al intentar actualizar al proveedor"
        );
    }
});

// Eliminar proveedor
app.post("/proveedores/eliminar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM proveedores
             WHERE id = $1`,
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).send(
                "Proveedor no encontrado"
            );
        }

        res.redirect(
            "/proveedores?mensaje=Proveedor eliminado correctamente"
        );

    } catch (error) {
        console.error(
            "Error al eliminar al proveedor:",
            error.message
        );

        res.status(500).send(
            "Ocurrió un error al intentar eliminar al proveedor"
        );
    }
});

/* =====================================================
   CONSULTA DE EMPLEADOS
===================================================== */

// Mostrar todos los empleados en la vista de consulta
app.get("/consulta", async (req, res) => {
    try {
        const consulta = {
            text: `
                SELECT id, nombre, cargo, sueldo
                FROM empleados
                ORDER BY id
            `,
            values: []
        };

        const resultado = await pool.query(consulta);

        res.render("consulta", {
            empleados: resultado.rows,
            cargo: "",
            sueldoMinimo: "",
            mensaje: ""
        });

    } catch (error) {
        console.error(
            "Error al obtener la lista de empleados:",
            error.message
        );

        res.status(500).render("consulta", {
            empleados: [],
            cargo: "",
            sueldoMinimo: "",
            mensaje: "No se pudo obtener la lista de empleados"
        });
    }
});

// Filtrar empleados por cargo y sueldo mínimo
app.post("/consulta", async (req, res) => {
    const cargo = req.body.cargo?.trim() || "";
    const sueldoMinimo =
        req.body.sueldoMinimo?.trim() || "";

    try {
        let textoConsulta = `
            SELECT id, nombre, cargo, sueldo
            FROM empleados
            WHERE 1 = 1
        `;

        const valores = [];

        if (cargo !== "") {
            valores.push(`%${cargo}%`);

            textoConsulta += `
                AND cargo ILIKE $${valores.length}
            `;
        }

        if (sueldoMinimo !== "") {
            const sueldo = Number(sueldoMinimo);

            if (
                !Number.isInteger(sueldo) ||
                sueldo < 0
            ) {
                return res.status(400).render("consulta", {
                    empleados: [],
                    cargo,
                    sueldoMinimo,
                    mensaje:
                        "El sueldo mínimo debe ser un número entero mayor o igual a 0"
                });
            }

            valores.push(sueldo);

            textoConsulta += `
                AND sueldo >= $${valores.length}
            `;
        }

        textoConsulta += `
            ORDER BY sueldo DESC
        `;

        const consulta = {
            text: textoConsulta,
            values: valores
        };

        const resultado = await pool.query(consulta);

        res.render("consulta", {
            empleados: resultado.rows,
            cargo,
            sueldoMinimo,
            mensaje:
                resultado.rowCount === 0
                    ? "No se encontraron registros"
                    : ""
        });

    } catch (error) {
        console.error(
            "Error al realizar la consulta:",
            error.message
        );

        res.status(500).render("consulta", {
            empleados: [],
            cargo,
            sueldoMinimo,
            mensaje: "No se pudo realizar la consulta"
        });
    }
});

app.get("/consulta_empleado", async (req, res) => {
    try {
        const consulta = {
            text: `
                SELECT id, nombre, cargo, sueldo
                FROM empleados
                ORDER BY id
            `,
            values: []
        };

        const resultado = await pool.query(consulta);

        res.render("consulta_empleado", {
            empleados: [],
            nombre: "",
            mensaje: ""
        });

    } catch (error) {
        console.error(
            "Error al obtener la lista de empleados:",
            error.message
        );

        res.status(500).render("consulta_empleado", {
            empleados: [],
            nombre: "",
            mensaje: "No se pudo obtener la lista de empleados"
        });
    }
});

app.post("/consulta_empleado", async (req, res) => {
    const nombre = req.body.nombre?.trim() || "";

    try {
        let textoConsulta = `
            SELECT id, nombre, cargo, sueldo
            FROM empleados
            WHERE 1 = 1
        `;

        const valores = [];

        if (nombre !== "") {
            valores.push(`%${nombre}%`);

            textoConsulta += `
                AND nombre ILIKE $${valores.length}
            `;
        }

        textoConsulta += `
            ORDER BY nombre
        `;

        const consulta = {
            text: textoConsulta,
            values: valores
        };

        const resultado = await pool.query(consulta);

        res.render("consulta_empleado", {
            empleados: resultado.rows,
            nombre,
            mensaje:
                resultado.rowCount === 0
                    ? "No se encontraron registros"
                    : ""
        });

    } catch (error) {
        console.error(
            "Error al realizar la consulta por nombre:",
            error.message
        );

        res.status(500).render("consulta_empleado", {
            empleados: [],
            nombre,
            mensaje: "No se pudo realizar la consulta"
        });
    }
});

app.get('/asistencias', async (req, res) => {
    try {

        const consulta = {
            text: `
                SELECT 
                    asistencias.id,
                    empleados.nombre,
                    asistencias.fecha,
                    asistencias.presente
                FROM asistencias
                INNER JOIN empleados
                    ON asistencias.empleado_id = empleados.id
                ORDER BY asistencias.fecha, empleados.nombre
            `,
            values: []
        };

        const resultado = await pool.query(consulta);

        res.render('asistencias', {
            asistencias: resultado.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).send('Error al consultar las asistencias');
    }

});

app.get("/consulta_asistencias_con_filtro", (req, res) => {
    res.render("consulta_asistencias_con_filtro", {
        asistencias: [],
        nombre: "",
        fecha: "",
        mensaje: ""
    });
});

app.post("/consulta_asistencias_con_filtro", async (req, res) => {
    const nombre = req.body.nombre?.trim() || "";
    const fecha = req.body.fecha?.trim() || "";

    if (nombre === "" && fecha === "") {
        return res.render("consulta_asistencias_con_filtro", {
            asistencias: [],
            nombre,
            fecha,
            mensaje: "Debe ingresar un nombre, una fecha o ambos campos"
        });
    }

    try {
        let textoConsulta = `
            SELECT
                asistencias.id,
                empleados.nombre,
                asistencias.fecha,
                asistencias.presente
            FROM asistencias
            INNER JOIN empleados
                ON asistencias.empleado_id = empleados.id
            WHERE 1 = 1
        `;

        const valores = [];

        if (nombre !== "") {
            valores.push(`%${nombre}%`);

            textoConsulta += `
                AND empleados.nombre ILIKE $${valores.length}
            `;
        }

        if (fecha !== "") {
            valores.push(fecha);

            textoConsulta += `
                AND asistencias.fecha::date = $${valores.length}::date
            `;
        }

        textoConsulta += `
            ORDER BY asistencias.fecha DESC, empleados.nombre
        `;

        const consulta = {
            text: textoConsulta,
            values: valores
        };

        const resultado = await pool.query(consulta);

        res.render("consulta_asistencias_con_filtro", {
            asistencias: resultado.rows,
            nombre,
            fecha,
            mensaje:
                resultado.rowCount === 0
                    ? "La asistencia no fue encontrada"
                    : ""
        });

    } catch (error) {
        console.error(
            "Error al consultar las asistencias:",
            error.message
        );

        res.status(500).render("consulta_asistencias_con_filtro", {
            asistencias: [],
            nombre,
            fecha,
            mensaje: "No se pudo realizar la consulta"
        });
    }
});

app.get('/registrar_asistencia', async (req, res) => {
    try {
        const consulta = {
            text: `
                    SELECT id, nombre
                    FROM empleados
                    ORDER BY nombre
                `,
            values: []
        };

        const resultado = await pool.query(consulta);

        res.render('registrar_asistencia', {
            empleados: resultado.rows,
            mensaje: '',
            tipoMensaje: ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar los empleados');
    }
});

app.post('/registrar_asistencia', async (req, res) => {
    const empleadoId = Number(req.body.empleado_id);
    const fecha = req.body.fecha;
    const presente = req.body.presente === 'true';

    const cambio = await pool.connect();

    try {
        await cambio.query('BEGIN');

        const consultaEmpleado = {
            text: `
                    SELECT id
                    FROM empleados
                    WHERE id = $1
                `,
            values: [empleadoId]
        };

        const resultadoEmpleado = await cambio.query(consultaEmpleado);

        if (resultadoEmpleado.rowCount === 0) {
            throw new Error('El empleado no existe');
        }

        const insertarAsistencia = {
            text: `
                    INSERT INTO asistencias (
                        empleado_id,
                        fecha,
                        presente
                    )
                    VALUES ($1, $2, $3)
                `,
            values: [empleadoId, fecha, presente]
        };

        await cambio.query(insertarAsistencia);

        if (presente) {
            const actualizarEmpleado = {
                text: `
                        UPDATE empleados
                        SET total_asistencias = total_asistencias + 1
                        WHERE id = $1
                    `,
                values: [empleadoId]
            };

            await cambio.query(actualizarEmpleado);
        }

        await cambio.query('COMMIT');

        const resultadoEmpleados = await pool.query({
            text: `
                    SELECT id, nombre
                    FROM empleados
                    ORDER BY nombre
                `,
            values: []
        });

        res.render('registrar_asistencia', {
            empleados: resultadoEmpleados.rows,
            mensaje: 'Asistencia registrada correctamente.',
            tipoMensaje: 'success'
        });
    } catch (error) {
        await cambio.query('ROLLBACK');

        console.error(error);

        const resultadoEmpleados = await pool.query({
            text: `
                    SELECT id, nombre
                    FROM empleados
                    ORDER BY nombre
                `,
            values: []
        });

        res.status(400).render('registrar_asistencia', {
            empleados: resultadoEmpleados.rows,
            mensaje: error.message,
            tipoMensaje: 'danger'
        });
    } finally {
        cambio.release();
    }
});

app.get("/cambiar_cargo", async (req, res) => {
    try {
        const consultaEmpleados = {
            text: `
                SELECT id, nombre, cargo
                FROM empleados
                ORDER BY nombre
            `,
            values: []
        };

        const consultaHistorial = {
            text: `
                SELECT
                    historial_cargos.id,
                    empleados.nombre,
                    historial_cargos.cargo_anterior,
                    historial_cargos.cargo_nuevo,
                    historial_cargos.fecha_cambio
                FROM historial_cargos
                INNER JOIN empleados
                    ON historial_cargos.empleado_id = empleados.id
                ORDER BY
                    historial_cargos.fecha_cambio DESC,
                    historial_cargos.id DESC
            `,
            values: []
        };

        const resultadoEmpleados = await pool.query(consultaEmpleados);
        const resultadoHistorial = await pool.query(consultaHistorial);

        res.render("cambiar_cargo", {
            empleados: resultadoEmpleados.rows,
            historial: resultadoHistorial.rows,
            mensaje: "",
            tipoMensaje: ""
        });

    } catch (error) {
        console.error(
            "Error al cargar el cambio de cargos:",
            error.message
        );

        res.status(500).send(
            "Error al cargar los empleados y el historial"
        );
    }
});

app.post("/cambiar_cargo", async (req, res) => {
    const empleadoId = Number(req.body.empleado_id);
    const cargoNuevo = req.body.cargo_nuevo?.trim() || "";

    const cambio = await pool.connect();

    try {
        if (!Number.isInteger(empleadoId) || empleadoId <= 0) {
            throw new Error("Debe seleccionar un empleado");
        }

        if (cargoNuevo === "") {
            throw new Error("Debe ingresar el nuevo cargo");
        }

        await cambio.query("BEGIN");

        // Consultar el cargo actual
        const consultaEmpleado = {
            text: `
                SELECT id, nombre, cargo
                FROM empleados
                WHERE id = $1
            `,
            values: [empleadoId]
        };

        const resultadoEmpleado = await cambio.query(consultaEmpleado);

        if (resultadoEmpleado.rowCount === 0) {
            throw new Error("El empleado no existe");
        }

        const cargoAnterior = resultadoEmpleado.rows[0].cargo;

        // Actualizar el cargo del empleado
        const actualizarCargo = {
            text: `
                UPDATE empleados
                SET cargo = $1
                WHERE id = $2
            `,
            values: [cargoNuevo, empleadoId]
        };

        await cambio.query(actualizarCargo);

        // Registrar el cambio en el historial
        const insertarHistorial = {
            text: `
                INSERT INTO historial_cargos (
                    empleado_id,
                    cargo_anterior,
                    cargo_nuevo,
                    fecha_cambio
                )
                VALUES ($1, $2, $3, CURRENT_DATE)
            `,
            values: [
                empleadoId,
                cargoAnterior,
                cargoNuevo
            ]
        };

        await cambio.query(insertarHistorial);

        await cambio.query("COMMIT");

        const resultadoEmpleados = await pool.query({
            text: `
                SELECT id, nombre, cargo
                FROM empleados
                ORDER BY nombre
            `,
            values: []
        });

        const resultadoHistorial = await pool.query({
            text: `
        SELECT
            historial_cargos.id,
            empleados.nombre,
            historial_cargos.cargo_anterior,
            historial_cargos.cargo_nuevo,
            historial_cargos.fecha_cambio
        FROM historial_cargos
        INNER JOIN empleados
            ON historial_cargos.empleado_id = empleados.id
        ORDER BY
            historial_cargos.fecha_cambio DESC,
            historial_cargos.id DESC
            `,
            values: []
        });

        res.render("cambiar_cargo", {
            empleados: resultadoEmpleados.rows,
            historial: resultadoHistorial.rows,
            mensaje: `El cargo fue cambiado de "${cargoAnterior}" a "${cargoNuevo}".`,
            tipoMensaje: "success"
        });

    } catch (error) {
        await cambio.query("ROLLBACK");

        console.error("Error al cambiar el cargo:", error.message);

        const resultadoEmpleados = await pool.query({
            text: `
                SELECT id, nombre, cargo
                FROM empleados
                ORDER BY nombre
            `,
            values: []
        });

        const resultadoHistorial = await pool.query({
            text: `
        SELECT
            historial_cargos.id,
            empleados.nombre,
            historial_cargos.cargo_anterior,
            historial_cargos.cargo_nuevo,
            historial_cargos.fecha_cambio
        FROM historial_cargos
        INNER JOIN empleados
            ON historial_cargos.empleado_id = empleados.id
        ORDER BY
            historial_cargos.fecha_cambio DESC,
            historial_cargos.id DESC
    `,
            values: []
        });

        res.status(400).render("cambiar_cargo", {
            empleados: resultadoEmpleados.rows,
            historial: resultadoHistorial.rows,
            mensaje: error.message,
            tipoMensaje: "danger"
        });

    } finally {
    cambio.release();
    }
});


/* =====================================================
   SERVIDOR
===================================================== */

app.listen(PORT, () => {
    console.log(
        `Servidor funcionando en http://localhost:${PORT}`
    );
});