const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const puerto = 3000;
const carpetaUploads = path.join(__dirname, "uploads");

if (!fs.existsSync(carpetaUploads)) {
    fs.mkdirSync(carpetaUploads, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, carpetaUploads),
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const extensiones = [".jpg", ".jpeg", ".png", ".gif"];
    const tipos = ["image/jpeg", "image/png", "image/gif"];

    if (!extensiones.includes(extension) || !tipos.includes(file.mimetype)) {
        const error = new Error("Tipo de archivo no permitido. Solo jpg, jpeg, png o gif.");
        error.status = 415;
        return cb(error);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(carpetaUploads));

app.post("/upload", upload.single("foto"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            ok: false,
            mensaje: "Debe seleccionar una imagen"
        });
    }

    res.status(201).json({
        ok: true,
        mensaje: "Imagen subida correctamente",
        archivo: req.file.filename,
        ruta: `/uploads/${req.file.filename}`
    });
});

app.get("/galeria", (req, res) => {
    fs.readdir(carpetaUploads, { withFileTypes: true }, (error, archivos) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al leer la galería"
            });
        }

        const imagenes = archivos
            .filter(archivo => archivo.isFile() && archivo.name !== ".gitkeep")
            .map(archivo => ({
                nombre: archivo.name,
                ruta: `/uploads/${archivo.name}`
            }));

        res.status(200).json({
            ok: true,
            data: imagenes
        });
    });
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                ok: false,
                mensaje: "La imagen supera el límite de 5 MB"
            });
        }

        return res.status(400).json({
            ok: false,
            mensaje: error.message
        });
    }

    if (error) {
        return res.status(error.status || 415).json({
            ok: false,
            mensaje: error.message
        });
    }

    next();
});

app.listen(puerto, () => {
    console.log(`Servidor funcionando en http://localhost:${puerto}`);
});
