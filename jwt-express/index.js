require("dotenv").config();

const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const auth = require("./middlewares/auth");

const app = express();
const puerto = process.env.PORT || 3000;
const rutaUsuarios = path.join(__dirname, "usuarios.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function leerUsuarios() {
    try {
        const contenido = await fs.readFile(rutaUsuarios, "utf-8");
        return JSON.parse(contenido);
    } catch (error) {
        if (error.code === "ENOENT") {
            await fs.writeFile(rutaUsuarios, "[]");
            return [];
        }
        throw error;
    }
}

async function guardarUsuarios(usuarios) {
    await fs.writeFile(
        rutaUsuarios,
        JSON.stringify(usuarios, null, 2)
    );
}


// REGISTRO

app.post("/auth/register", async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
        return res.status(400).json({
            ok: false,
            mensaje: "Email y password son requeridos"
        });
    }

    if (!email.includes("@") || password.length < 6) {
        return res.status(400).json({
            ok: false,
            mensaje: "Email inválido o password menor a 6 caracteres"
        });
    }

    try {
        const usuarios = await leerUsuarios();

        if (usuarios.find(usuario => usuario.email === email)) {
            return res.status(409).json({
                ok: false,
                mensaje: "Email ya registrado"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            id: Math.max(0, ...usuarios.map(usuario => usuario.id)) + 1,
            email,
            passwordHash,
            role: "user"
        };

        usuarios.push(nuevoUsuario);
        await guardarUsuarios(usuarios);

        res.status(201).json({
            ok: true,
            mensaje: "Usuario registrado correctamente",
            data: {
                id: nuevoUsuario.id,
                email: nuevoUsuario.email,
                role: nuevoUsuario.role
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al registrar usuario"
        });
    }
});


// LOGIN

app.post("/auth/login", async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
        return res.status(400).json({
            ok: false,
            mensaje: "Email y password son requeridos"
        });
    }

    try {
        const usuarios = await leerUsuarios();
        const usuario = usuarios.find(usuario => usuario.email === email);

        if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
            return res.status(401).json({
                ok: false,
                mensaje: "Credenciales inválidas"
            });
        }

        const token = jwt.sign(
            {
                sub: usuario.id,
                email: usuario.email,
                role: usuario.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES || "15m"
            }
        );

        res.status(200).json({
            ok: true,
            token
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al iniciar sesión"
        });
    }
});


// RUTA PROTEGIDA

app.get("/api/perfil", auth, (req, res) => {
    res.status(200).json({
        ok: true,
        data: {
            id: req.user.sub,
            email: req.user.email,
            role: req.user.role
        }
    });
});


// RUTA NO ENCONTRADA

app.use((req, res) => {
    res.status(404).json({
        ok: false,
        mensaje: "Ruta no encontrada"
    });
});


app.listen(puerto, () => {
    console.log(`API segura en http://localhost:${puerto}`);
});
