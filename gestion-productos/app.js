require("dotenv").config();

const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();

const puerto = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const rutaProductos = path.join(__dirname, "productos.txt");

app.get("/productos", async (req, res) => {
    try {
        const contenido = await fs.readFile(
            rutaProductos,
            "utf-8"
        );

        const lineas = contenido
            .split(/\r?\n/)
            .filter(linea => linea.trim() !== "");

        const productos = lineas.map(linea => {
            const datos = linea.split(",");

            const nombre = datos[0].trim();
            const precio = Number(datos[1].trim());

            return {
                nombre: nombre,
                precio: precio
            };
        });

        res.status(200).json(productos);

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            error: "No fue posible leer los productos"
        });
    }
});

app.post("/productos", async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);
        
        const nombre = req.body.nombre;
        const precio = Number(req.body.precio);

        if (
            !nombre ||
            nombre.trim() === "" ||
            isNaN(precio) ||
            precio <= 0
        ) {
            return res.status(400).json({
                error: "Nombre y precio deben ser válidos"
            });
        }

        const nuevaLinea = `\n${nombre.trim()}, ${precio}`;

        await fs.appendFile(
            rutaProductos,
            nuevaLinea,
            "utf-8"
        );

        res.status(201).json({
            mensaje: "Producto agregado correctamente",
            producto: {
                nombre: nombre.trim(),
                precio: precio
            }
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            error: "No fue posible agregar el producto"
        });
    }
});

app.all("/productos", (req, res) => {
    res.status(405).json({
        error: `Método ${req.method} no permitido`
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada"
    });
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
        return res.status(400).json({
            error: "El JSON enviado no es válido"
        });
    }
    
    console.error(
        "Error interno:",
        error.message
    );

    res.status(500).json({
        error: "Ocurrió un error interno en el servidor"
    });
});

app.listen(puerto, () => {
    console.log(
        `Servidor funcionando en http://localhost:${puerto}`
    );
});