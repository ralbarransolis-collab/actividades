require("dotenv").config();

const express = require("express");
const path = require("path");
const sequelize = require("./data/db");
const { Pelicula, Actor, PeliculasActores } = require("./models");

const app = express();
const puerto = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/peliculas", async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll({
            include: {
                model: Actor,
                through: { attributes: [] }
            },
            order: [["id", "ASC"]]
        });

        res.json(peliculas);

    } catch (error) {
        console.error("Error al obtener películas:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener las películas"
        });
    }
});

app.post("/peliculas", async (req, res) => {
    const titulo = req.body.titulo?.trim();
    const anio = Number(req.body.anio);

    const actorIds = Array.isArray(req.body.actor_ids)
        ? req.body.actor_ids.map(Number)
        : [];

    if (!titulo) {
        return res.status(400).json({
            ok: false,
            mensaje: "Debe ingresar el título de la película"
        });
    }

    if (!Number.isInteger(anio) || anio < 1888 || anio > 2100) {
        return res.status(400).json({
            ok: false,
            mensaje: "Debe ingresar un año válido"
        });
    }

    try {
        const peliculaCreada = await sequelize.transaction(async (t) => {

            const pelicula = await Pelicula.create(
                { titulo, anio },
                { transaction: t }
            );

            if (actorIds.length > 0) {
                const idsUnicos = [...new Set(actorIds)];

                const actores = await Actor.findAll({
                    where: { id: idsUnicos },
                    transaction: t
                });

                if (actores.length !== idsUnicos.length) {
                    const error = new Error("Uno o más actores no existen");
                    error.status = 400;
                    throw error;
                }

                await pelicula.addActors(
                    actores,
                    { transaction: t }
                );
            }

            return pelicula;
        });

        const peliculaCompleta = await Pelicula.findByPk(
            peliculaCreada.id,
            {
                include: {
                    model: Actor,
                    through: { attributes: [] }
                }
            }
        );

        res.status(201).json({
            ok: true,
            mensaje: "Película creada correctamente",
            pelicula: peliculaCompleta
        });

    } catch (error) {
        console.error("Error al crear película:", error.message);

        res.status(error.status || 500).json({
            ok: false,
            mensaje: error.status
                ? error.message
                : "Error al crear la película"
        });
    }
});

app.get("/actores", async (req, res) => {
    try {
        const actores = await Actor.findAll({
            include: {
                model: Pelicula,
                through: { attributes: [] }
            },
            order: [["id", "ASC"]]
        });

        res.json(actores);

    } catch (error) {
        console.error("Error al obtener actores:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los actores"
        });
    }
});

app.post("/actores", async (req, res) => {
    const nombre = req.body.nombre?.trim();
    const fechaNacimiento = req.body.fecha_nacimiento;

    if (!nombre) {
        return res.status(400).json({
            ok: false,
            mensaje: "Debe ingresar el nombre del actor"
        });
    }

    if (!fechaNacimiento) {
        return res.status(400).json({
            ok: false,
            mensaje: "Debe ingresar la fecha de nacimiento"
        });
    }

    try {
        const actorCreado = await Actor.create({
            nombre,
            fecha_nacimiento: fechaNacimiento
        });

        res.status(201).json({
            ok: true,
            mensaje: "Actor creado correctamente",
            actor: actorCreado
        });

    } catch (error) {
        console.error("Error al crear actor:", error.message);

        res.status(400).json({
            ok: false,
            mensaje: "No fue posible crear el actor"
        });
    }
});

app.post("/asignar-actor", async (req, res) => {
    const peliculaId = Number(req.body.pelicula_id);
    const actorId = Number(req.body.actor_id);

    if (!Number.isInteger(peliculaId) || peliculaId <= 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Debe seleccionar una película válida"
        });
    }

    if (!Number.isInteger(actorId) || actorId <= 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Debe seleccionar un actor válido"
        });
    }

    try {
        const resultado = await sequelize.transaction(async (t) => {

            const pelicula = await Pelicula.findByPk(
                peliculaId,
                { transaction: t }
            );

            if (!pelicula) {
                const error = new Error(
                    "La película seleccionada no existe"
                );

                error.status = 404;
                throw error;
            }

            const actor = await Actor.findByPk(
                actorId,
                { transaction: t }
            );

            if (!actor) {
                const error = new Error(
                    "El actor seleccionado no existe"
                );

                error.status = 404;
                throw error;
            }

            const relacionExistente = await PeliculasActores.findOne({
                where: {
                    pelicula_id: peliculaId,
                    actor_id: actorId
                },
                transaction: t
            });

            if (relacionExistente) {
                const error = new Error(
                    "El actor ya está asignado a esta película"
                );

                error.status = 409;
                throw error;
            }

            await PeliculasActores.create(
                {
                    pelicula_id: peliculaId,
                    actor_id: actorId
                },
                {
                    transaction: t
                }
            );

            return { pelicula, actor };
        });

        res.status(201).json({
            ok: true,
            mensaje: "Actor asignado correctamente a la película",

            pelicula: {
                id: resultado.pelicula.id,
                titulo: resultado.pelicula.titulo
            },

            actor: {
                id: resultado.actor.id,
                nombre: resultado.actor.nombre
            }
        });

    } catch (error) {
        console.error("Error al asignar actor:", error.message);

        res.status(error.status || 500).json({
            ok: false,
            mensaje: error.status
                ? error.message
                : "Error al asignar el actor"
        });
    }
});

async function iniciarServidor() {
    try {
        await sequelize.authenticate();
        console.log("Conexión a PostgreSQL correcta");

        await sequelize.sync();
        console.log("Base de datos sincronizada");

        app.listen(puerto, () => {
            console.log(
                `Servidor funcionando en http://localhost:${puerto}`
            );
        });

    } catch (error) {
        console.error(
            "Error al iniciar servidor:",
            error.message
        );
    }
}

iniciarServidor();