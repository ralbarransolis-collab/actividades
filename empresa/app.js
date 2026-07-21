require("dotenv").config();

const express = require("express");
const path = require("path");
const pool = require("./config/db");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true}));

app.use(express.static(path.join(__dirname, "public")));

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
    }
    catch (error) {
        console.log("Error al consultar los datos");
    }

});

app.post("/empleados", async (req, res) => {
    try {
        const { nombre, cargo, sueldo } = req.body;

        if (!nombre || !cargo || !sueldo) {
            return res.redirect("/?error=Todos los campos son obligatorios");
        }
        const sueldoNumero = Number(sueldo);

        if (!Number.isInteger(sueldoNumero) || sueldoNumero <= 0) {
            return res.redirect("/?error=El sueldo debe superior a 0");
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

        res.redirect("/?mensaje=Empleado registrado correctamente");
    }
    catch (error) {
        console.log("Error al ingresar los datos");

        res.redirect("/?error=No fue posible ergistrar el empleado")
    }
});

app.get("/empleados/editar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM empleados WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send("Empleado no encontrado");
        }

        res.render("editar-empleado", {
            empleado: resultado.rows[0],
            error: null
        });

    } catch (error) {
        console.log("Error al buscar el empleado:", error);

        res.status(500).send(
            "Ocurrió un error al buscar al empleado"
        );
    }
});

app.post("/empleados/actualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, cargo, sueldo } = req.body;

        if (!nombre || !cargo || !sueldo) {

            return res.status(400).send("Todos los campos son requeridos");
        }
        const sueldoNumero = Number(sueldo);

        if (!Number.isInteger(sueldoNumero) || sueldoNumero <= 0) {
            return res.status(400).send("El sueldo debe ser un número entero mayor a 0");
        }
        const resultado = await pool.query(
            `UPDATE empleados
            SET nombre = $1,
                cargo= $2,
                sueldo = $3
            WHERE id =$4`,
            [
                nombre.trim(),
                cargo.trim(),
                sueldoNumero,
                id
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).send("Empleado no encontrado")
        }

        res.redirect(
    "/proveedores?mensaje=Proveedor actualizado correctamente"
);
    }
    catch (error) {
        console.log("Error al actualizar al empleado");

        res.status(500).send("Ocurrió un error al intentar actualizar al empleado")

    }

});

app.post("/empleados/eliminar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(`
                DELETE FROM empleados
                WHERE id = $1
                `,
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).send("Empleado no encontrado")
        }

        res.redirect(
    "/proveedores?mensaje=Proveedor eliminado correctamente"
);
    }
    catch (error) {
        console.log("Error al eliminar al empleado");

        res.status(500).send("Ocurrió un error al intentar eliminar al empleado")

    }
});

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

app.post("/proveedores", async (req, res) => {
    try {
        const { nombre, direccion, telefono, email } = req.body;

        if (!nombre || !direccion || !telefono || !email) {
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

app.get("/proveedores/editar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM proveedores WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).send("Proveedor no encontrado");
        }

        res.render("editar-proveedor", {
            proveedor: resultado.rows[0],
            error: null
        });

    } catch (error) {
        console.log("Error al buscar el proveedor:", error);

        res.status(500).send(
            "Ocurrió un error al buscar al proveedor"
        );
    }
});

app.post("/proveedores/actualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, telefono, email } = req.body;

        if (!nombre || !direccion || !telefono || !email) {

            return res.status(400).send("Todos los campos son requeridos");
        }
        
        const resultado = await pool.query(
            `UPDATE proveedores
            SET nombre = $1,
                direccion = $2,
                telefono = $3,
                email = $4
            WHERE id =$5`,
            [
                nombre.trim(),
                direccion.trim(),
                telefono.trim(),
                email.trim(),
                id
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).send("Proveedor no encontrado")
        }

        res.redirect("/proveedores?mensaje=Proveedor actualizado correctamente"
);
    }
    catch (error) {
        console.log("Error al actualizar al proveedor");

        res.status(500).send("Ocurrió un error al intentar actualizar al proveedor")

    }

});

app.post("/proveedores/eliminar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(`
                DELETE FROM proveedores
                WHERE id = $1
                `,
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).send("Proveedor no encontrado")
        }

        res.redirect("/proveedores?mensaje=Proveedor eliminado correctamente"
);
    }
    catch (error) {
        console.log("Error al eliminar al proveedor");

        res.status(500).send("Ocurrió un error al intentar eliminar al proveedor")

    }
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});