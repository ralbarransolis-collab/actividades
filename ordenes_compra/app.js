require("dotenv").config();

const express = require("express");
const pool = require("./data/db");
const app = express();
const puerto =process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));

app.use(express.json());
app.use(express.static("public"));


app.get("/", async (req, res) => {
    const filtro =
        req.query.filtro;

    if (!filtro) {
        return res.render("inicio");
    }
    try {
        if (filtro === "productos") {

            const id = req.query.id;
            const orden = req.query.orden;

            if (id) {
                const idProducto = Number(id);

                if (!Number.isInteger(idProducto) || idProducto <= 0) {
                    return res.status(400) .json({
                            ok: false,
                            mensaje: "El id del producto no es válido"
                        });
                }

                const consultaProducto = {
                    text: `
                        SELECT
                            id_producto,
                            nombre,
                            precio,
                            existencias
                        FROM productos
                        WHERE id_producto = $1
                    `,
                    values: [
                        idProducto
                    ]
                };

                const resultadoProducto = await pool.query(consultaProducto);

                if (resultadoProducto.rowCount === 0) {
                    return res.status(404).json({
                            ok: false,
                            mensaje: "Producto no encontrado"
                        });
                }
                return res.json({
                    ok: true,
                    producto: resultadoProducto.rows[0]
                });
            }

            if (orden) {
                const idOrden = Number(orden);

                if (!Number.isInteger(idOrden) || idOrden <= 0) {
                    return res.status(400).json({
                            ok: false,
                            mensaje:
                                "El id de la orden no es válido"
                        });
                }
                const consultaProductosOrden = {
                    text: `
                        SELECT
                            lp.id_lista,
                            lp.id_orden,
                            p.id_producto,
                            p.nombre,
                            p.precio,
                            lp.cantidad_producto,
                            (
                                p.precio *
                                lp.cantidad_producto
                            ) AS subtotal
                        FROM lista_productos AS lp
                        INNER JOIN productos AS p
                            ON lp.id_producto =
                               p.id_producto
                        WHERE lp.id_orden = $1
                        ORDER BY p.nombre
                    `,
                    values: [
                        idOrden
                    ]
                };

                const resultado =
                    await pool.query(consultaProductosOrden );

                return res.json({
                    ok: true,
                    productos:resultado.rows
                });
            }

            const consultaProductos = {
                text: `
                    SELECT
                        id_producto,
                        nombre,
                        precio,
                        existencias
                    FROM productos
                    ORDER BY id_producto
                `,
                values: []
            };

            const resultadoProductos = await pool.query(consultaProductos);

            return res.json({
                ok: true,
                productos: resultadoProductos.rows
            });
        }

        if (filtro === "ordenes") {
            const rut = req.query.rut;

            if (!rut) {
                return res.status(400).json({
                        ok: false,
                        mensaje:
                            "Debe ingresar el RUT del cliente"
                    });
            }
            const consultaOrdenes = {
                text: `
                    SELECT
                        o.id_orden,
                        o.rut_cliente,
                        c.nombre,
                        o.fecha_orden,
                        d.estado,
                        COALESCE(
                            SUM(
                                p.precio *
                                lp.cantidad_producto
                            ),
                            0
                        ) AS total
                    FROM orden AS o
                    INNER JOIN clientes AS c
                        ON o.rut_cliente =
                           c.rut
                    LEFT JOIN despachos AS d
                        ON o.id_orden =
                           d.id_orden
                    LEFT JOIN lista_productos AS lp
                        ON o.id_orden =
                           lp.id_orden
                    LEFT JOIN productos AS p
                        ON lp.id_producto =
                           p.id_producto
                    WHERE o.rut_cliente = $1
                    GROUP BY
                        o.id_orden,
                        o.rut_cliente,
                        c.nombre,
                        o.fecha_orden,
                        d.estado
                    ORDER BY
                        o.fecha_orden DESC
                `,
                values: [
                    rut
                ]
            };

            const resultadoOrdenes =
                await pool.query(consultaOrdenes);

            return res.json({
                ok: true,
                ordenes: resultadoOrdenes.rows
            });
        }

        if (filtro === "clientes") {
            const rut = req.query.rut;

            if (rut) {
                const consultaCliente = {
                    text: `
                        SELECT
                            rut,
                            nombre,
                            correo
                        FROM clientes
                        WHERE rut = $1
                    `,
                    values: [
                        rut
                    ]
                };

                const resultadoCliente = await pool.query(consultaCliente);

                if (resultadoCliente.rowCount === 0 ) {
                    return res.status(404).json({
                            ok: false,
                            mensaje: "Cliente no encontrado"
                        });
                }

                return res.json({
                    ok: true,
                    cliente: resultadoCliente.rows[0]
                });
            }

            const consultaClientes = {
                text: `
                    SELECT
                        rut,
                        nombre,
                        correo
                    FROM clientes
                    ORDER BY nombre
                `,
                values: []
            };

            const resultadoClientes = await pool.query(consultaClientes);

            return res.json({
                ok: true,
                clientes: resultadoClientes.rows
            });
        }

        if (filtro === "direcciones") {
            const rut =req.query.rut;

            if (!rut) {
                return res.status(400).json({
                        ok: false,
                        mensaje:
                            "Debe ingresar el RUT"
                    });
            }

            const consultaDirecciones = {
                text: `
                    SELECT
                        id_direccion,
                        rut_cliente,
                        direccion,
                        comuna
                    FROM direcciones
                    WHERE rut_cliente = $1
                    ORDER BY id_direccion
                `,
                values: [
                    rut
                ]
            };

            const resultadoDirecciones = await pool.query(consultaDirecciones);

            return res.json({
                ok: true,
                direcciones: resultadoDirecciones.rows
            });
        }
       if (filtro === "despachos") {
            const idOrden = Number( req.query.orden );

            if (!Number.isInteger(idOrden) || idOrden <= 0) {
                return res.status(400).json({
                        ok: false,
                        mensaje:
                            "Debe ingresar un id de orden válido"
                    });
            }
            const consultaDespacho = {
                text: `
                    SELECT
                        d.id_despacho,
                        d.id_orden,
                        d.estado,
                        di.id_direccion,
                        di.direccion,
                        di.comuna
                    FROM despachos AS d
                    INNER JOIN direcciones AS di
                        ON d.id_direccion =
                           di.id_direccion
                    WHERE d.id_orden = $1
                `,
                values: [
                    idOrden
                ]
            };

            const resultadoDespacho = await pool.query(consultaDespacho);

            if (
                resultadoDespacho.rowCount === 0) {
                return res.status(404).json({
                        ok: false,
                        mensaje: "Despacho no encontrado"
                    });
            }
            return res.json({
                ok: true,
                despacho: resultadoDespacho.rows[0]
            });
        }

        return res.status(400).json({
                ok: false,
                mensaje:
                    "Filtro no válido"
            });

    } catch (error) {
        console.error(
            "Error en consulta GET:",
            error.message
        );

        return res.status(500).json({
                ok: false,
                mensaje:
                    "Error interno del servidor"

            });
    }
});

app.get("/productos", async (req, res) => {

    try {
        const consulta = {
            text: `
                SELECT
                    id_producto,
                    nombre,
                    precio,
                    existencias
                FROM productos
                ORDER BY id_producto
            `,
            values: []
        };

        const resultado = await pool.query(consulta);

        res.render( "productos",
            {
                productos:  resultado.rows
            }
        );

    } catch (error) {
        console.error(
            "Error al cargar productos:",
            error.message
        );

        res.status(500).send(
            "Error al cargar productos"
        );
    }
});

app.get("/ordenes", async (req, res) => {
    try {
        const consultaClientes = {
            text: `
                SELECT
                    rut,
                    nombre,
                    correo
                FROM clientes
                ORDER BY nombre
            `,
            values: []
        };

        const resultadoClientes =
            await pool.query(
                consultaClientes
            );

        res.render(
            "ordenes",
            {
                clientes:
                    resultadoClientes.rows
            }
        );

    } catch (error) {
        console.error(
            "Error al cargar clientes:",
            error.message
        );

        res.status(500).send(
            "Error al cargar la página"
        );
    }
});

app.get("/crear-orden", async (req, res) => {

    try {
        const consultaProductos = {
            text: `
                SELECT
                    id_producto,
                    nombre,
                    precio,
                    existencias
                FROM productos
                ORDER BY nombre
            `,
            values: []
        };

        const resultadoProductos = await pool.query(consultaProductos);

        res.render("crear_orden",
            {
                productos: resultadoProductos.rows
            }
        );

    } catch (error) {
        console.error(
            "Error al cargar creación de orden:",
            error.message
        );

        res.status(500).send(
            "Error al cargar la página"
        );
    }
});

app.post("/orden", async (req, res) => {

    const rut = req.body.rut;

    const direccionId = Number( req.body.direccion_id);

    const productos = req.body.productos;

    if (!rut) {
        return res.status(400).json({
                ok: false,
                mensaje:
                    "Debe ingresar el RUT del cliente"
            });
    }

    if (!Number.isInteger(direccionId) || direccionId <= 0) {
        return res.status(400).json({
                ok: false,
                mensaje:
                    "Debe seleccionar una dirección válida"
            });
    }

    if (!Array.isArray(productos) || productos.length === 0) {
             return res.status(400).json({
                ok: false,
                mensaje: "Debe seleccionar al menos un producto"
            });
    }

    const productosValidados = [];

    for (const producto of productos) {

        const idProducto = Number(producto.id_producto);

        const cantidad = Number(producto.cantidad_producto);

        if (!Number.isInteger(idProducto) || idProducto <= 0) {
            return res.status(400).json({
                    ok: false,
                    mensaje: "Hay un producto con id inválido"
                });
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400) .json({
                    ok: false,
                    mensaje:"Las cantidades deben ser mayores que cero"
                });
        }

        productosValidados.push({
            id_producto: idProducto,
            cantidad_producto:  cantidad
        });
    }

    let conexion;

    try {
        conexion = await pool.connect();

        await conexion.query("BEGIN");

        const consultaCliente = {
            text: `
                SELECT
                    rut,
                    nombre,
                    correo
                FROM clientes
                WHERE rut = $1
            `,
            values: [
                rut
            ]
        };

        const resultadoCliente =
            await conexion.query(
                consultaCliente
            );

        if (
            resultadoCliente.rowCount === 0
        ) {
            const error =
                new Error(
                    "El cliente no existe"
                );
            error.status = 400;
            throw error;
        }

        const consultaDireccion = {
            text: `
                SELECT
                    id_direccion,
                    rut_cliente,
                    direccion,
                    comuna
                FROM direcciones
                WHERE id_direccion = $1
                AND rut_cliente = $2
            `,
            values: [
                direccionId,
                rut
            ]
        };

        const resultadoDireccion =
            await conexion.query(
                consultaDireccion
            );

        if (
            resultadoDireccion.rowCount === 0
        ) {
            const error =
                new Error(
                    "La dirección seleccionada no pertenece al cliente"
                );
            error.status = 400;
            throw error;
        }

        const insertarOrden = {
            text: `
                INSERT INTO orden (
                    rut_cliente
                )
                VALUES ($1)
                RETURNING
                    id_orden,
                    rut_cliente,
                    fecha_orden
            `,
            values: [
                rut
            ]
        };

        const resultadoOrden = await conexion.query(insertarOrden);

        const ordenCreada = resultadoOrden.rows[0];

        const idOrden = ordenCreada.id_orden;

        const insertarDespacho = {
            text: `
                INSERT INTO despachos (
                    id_orden,
                    id_direccion
                )
                VALUES ($1, $2)
                RETURNING
                    id_despacho,
                    id_orden,
                    id_direccion,
                    estado
            `,
            values: [
                idOrden,
                direccionId
            ]

        };

        const resultadoDespacho = await conexion.query(insertarDespacho);

        const despachoCreado = resultadoDespacho.rows[0];

        const detalleProductos = [];

        for (const productoSolicitado of productosValidados) {

            const idProducto = productoSolicitado.id_producto;

            const cantidad = productoSolicitado.cantidad_producto;

            const consultaProducto = {
                text: `
                    SELECT
                        id_producto,
                        nombre,
                        precio,
                        existencias
                    FROM productos
                    WHERE id_producto = $1
                    FOR UPDATE
                `,
                values: [
                    idProducto
                ]
            };

            const resultadoProducto =
                await conexion.query(
                    consultaProducto
                );

            if (
                resultadoProducto.rowCount === 0
            ) {
                const error =
                    new Error(
                        `El producto con id ${idProducto} no existe`
                    );
                error.status = 400;
                throw error;
            }

            const producto = resultadoProducto.rows[0];

            const stockActual = Number(producto.existencias);

            const nuevoStock = stockActual - cantidad;

            if (nuevoStock < 0) {
                const error =
                    new Error(
                        `Stock insuficiente para "${producto.nombre}". ` +
                        `Disponible: ${stockActual}. ` +
                        `Solicitado: ${cantidad}`
                    );
                error.status = 409;
                throw error;
            }

            const insertarLista = {
                text: `
                    INSERT INTO lista_productos (
                        id_orden,
                        id_producto,
                        cantidad_producto
                    )
                    VALUES ($1, $2, $3)
                    RETURNING id_lista
                `,
                values: [
                    idOrden,
                    idProducto,
                    cantidad
                ]

            };

            await conexion.query(insertarLista);

            const actualizarStock = {
                text: `
                    UPDATE productos
                    SET existencias =
                        existencias - $1
                    WHERE id_producto = $2
                    RETURNING existencias
                `,
                values: [
                    cantidad,
                    idProducto
                ]
            };

            const resultadoStock = await conexion.query(actualizarStock);

            detalleProductos.push({

                id_producto: producto.id_producto,
                nombre: producto.nombre,
                precio: Number(producto.precio),
                cantidad_producto: cantidad,
                stock_anterior: stockActual,
                stock_nuevo: Number(resultadoStock.rows[0].existencias)
            });
        }
        await conexion.query("COMMIT");
        return res
            .status(201)
            .json({
                ok: true,
                mensaje:
                    "Orden creada correctamente",
                orden: {
                    ...ordenCreada,
                    cliente: resultadoCliente.rows[0],
                    direccion: resultadoDireccion.rows[0],
                    despacho: despachoCreado,
                    productos: detalleProductos
                }
            });

    } catch (error) {
        if (conexion) {
            await conexion.query(
                "ROLLBACK"
            );
        }

        console.error(
            "Error al crear orden:",
            error.message
        );

        const status =
            error.status || 500;

        return res
            .status(status)
            .json({

                ok: false,

                mensaje:
                    status === 500
                        ? "Error interno al crear la orden"
                        : error.message
            });

    } finally {
        if (conexion) {
            conexion.release();
        }
    }
});

app.listen(
    puerto,
    () => {
        console.log(
            `Servidor funcionando en http://localhost:${puerto}`
        );
    }
);