const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const puerto = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const rutaPartidas = path.join(__dirname, "data", "partidas.json");

// Guarda los datos de la partida que se está jugando.
// Esta versión es básica y está pensada para un solo jugador a la vez.
let partidaActual = null;

function leerPartidas() {
    const contenido = fs.readFileSync(rutaPartidas, "utf-8");
    return JSON.parse(contenido);
}

function guardarPartida(partida) {
    const partidas = leerPartidas();
    partidas.push(partida);

    fs.writeFileSync(
        rutaPartidas,
        JSON.stringify(partidas, null, 2),
        "utf-8"
    );
}

function escribirPartidas(partidas) {
    fs.writeFileSync(
        rutaPartidas,
        JSON.stringify(partidas, null, 2),
        "utf-8"
    );
}

function obtenerFechaActual() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();

    return `${dia}-${mes}-${anio}`;
}

app.get("/", (req, res) => {
    res.render("inicio", {
        mensaje: ""
    });
});

app.post("/comenzar", (req, res) => {
    const nombre = req.body.nombre.trim();

    if (nombre === "") {
        return res.render("inicio", {
            mensaje: "Debe ingresar su nombre."
        });
    }

    partidaActual = {
        nombre: nombre,
        numeroSecreto: Math.floor(Math.random() * 10) + 1,
        intentosUtilizados: 0,
        intentosMaximos: 5,
        mensaje: "Ingrese un número entre 1 y 10.",
        terminada: false,
        gano: false,
        puntaje: 0,
        registrada: false
    };

    res.redirect("/jugar");
});

app.get("/jugar", (req, res) => {
    if (partidaActual === null) {
        return res.redirect("/");
    }

    res.render("jugar", {
        partida: partidaActual
    });
});

app.post("/intentar", (req, res) => {
    if (partidaActual === null) {
        return res.redirect("/");
    }

    if (partidaActual.terminada) {
        return res.redirect("/jugar");
    }

    const numeroIngresado = Number(req.body.numero);

    if (
        !Number.isInteger(numeroIngresado) ||
        numeroIngresado < 1 ||
        numeroIngresado > 10
    ) {
        partidaActual.mensaje = "Debe ingresar un número entero entre 1 y 10.";
        return res.redirect("/jugar");
    }

    partidaActual.intentosUtilizados++;

    if (numeroIngresado === partidaActual.numeroSecreto) {
        partidaActual.terminada = true;
        partidaActual.gano = true;

        if (partidaActual.intentosUtilizados === 1) {
            partidaActual.puntaje = 3;
        } else {
            partidaActual.puntaje = 1;
        }

        partidaActual.mensaje = "¡Adivinaste el número!";
    } else if (
        partidaActual.intentosUtilizados === partidaActual.intentosMaximos
    ) {
        partidaActual.terminada = true;
        partidaActual.gano = false;
        partidaActual.puntaje = 0;
        partidaActual.mensaje = "Utilizaste los cinco intentos. Perdiste la partida.";
    } else if (numeroIngresado < partidaActual.numeroSecreto) {
        partidaActual.mensaje = "El número secreto es mayor.";
    } else {
        partidaActual.mensaje = "El número secreto es menor.";
    }

    if (partidaActual.terminada && !partidaActual.registrada) {
        guardarPartida({
            nombre: partidaActual.nombre,
            puntaje: partidaActual.puntaje,
            fecha: obtenerFechaActual()
        });

        partidaActual.registrada = true;
    }

    res.redirect("/jugar");
});

app.get("/historial", (req, res) => {
    const partidas = leerPartidas();

    const totalPartidas = partidas.length;
    const partidasGanadas = partidas.filter(
        (partida) => partida.puntaje > 0
    ).length;
    const partidasPerdidas = partidas.filter(
        (partida) => partida.puntaje === 0
    ).length;
    const puntajeTotal = partidas.reduce(
        (acumulador, partida) => acumulador + partida.puntaje,
        0
    );

    res.render("historial", {
        partidas: partidas,
        totalPartidas: totalPartidas,
        partidasGanadas: partidasGanadas,
        partidasPerdidas: partidasPerdidas,
        puntajeTotal: puntajeTotal
    });
});

app.get("/historialPersonal", (req, res) => {
    res.render("historialPersonal", {
        nombreBuscado: "",
        partidasJugador: [],
        totalPartidas: 0,
        puntajeAcumulado: 0,
        puntajePromedio: 0,
        busquedaRealizada: false,
        mensaje: ""
    });
});

app.post("/historialPersonal", (req, res) => {
    const nombreBuscado = req.body.nombre.trim();

    if (nombreBuscado === "") {
        return res.render("historialPersonal", {
            nombreBuscado: "",
            partidasJugador: [],
            totalPartidas: 0,
            puntajeAcumulado: 0,
            puntajePromedio: 0,
            busquedaRealizada: false,
            mensaje: "Debe ingresar el nombre de un jugador."
        });
    }

    const partidas = leerPartidas();

    const partidasJugador = partidas.filter((partida) => {
        return partida.nombre.toLowerCase() === nombreBuscado.toLowerCase();
    });

    const totalPartidas = partidasJugador.length;

    const puntajeAcumulado = partidasJugador.reduce(
        (acumulador, partida) => acumulador + partida.puntaje,
        0
    );

    let puntajePromedio = 0;

    if (totalPartidas > 0) {
        puntajePromedio = puntajeAcumulado / totalPartidas;
    }

    res.render("historialPersonal", {
        nombreBuscado: nombreBuscado,
        partidasJugador: partidasJugador,
        totalPartidas: totalPartidas,
        puntajeAcumulado: puntajeAcumulado,
        puntajePromedio: puntajePromedio,
        busquedaRealizada: true,
        mensaje: ""
    });
});

app.post("/eliminar-historial-jugador", (req, res) => {
    const nombreBuscado = req.body.nombre.trim();
    const partidas = leerPartidas();

    const partidasRestantes = partidas.filter((partida) => {
        return partida.nombre.toLowerCase() !== nombreBuscado.toLowerCase();
    });

    escribirPartidas(partidasRestantes);

    res.render("historialPersonal", {
        nombreBuscado: nombreBuscado,
        partidasJugador: [],
        totalPartidas: 0,
        puntajeAcumulado: 0,
        puntajePromedio: 0,
        busquedaRealizada: false,
        mensaje: `Se eliminó el historial de ${nombreBuscado}.`
    });
});

app.get("/ranking", (req, res) => {
    const partidas = leerPartidas();

    const jugadores = {};

    partidas.forEach((partida) => {
        const nombreNormalizado = partida.nombre.toLowerCase();

        if (jugadores[nombreNormalizado] === undefined) {
            jugadores[nombreNormalizado] = {
                nombre: partida.nombre,
                puntajeAcumulado: 0
            };
        }

        jugadores[nombreNormalizado].puntajeAcumulado += partida.puntaje;
    });

    const ranking = Object.values(jugadores);

    ranking.sort((jugadorA, jugadorB) => {
        return jugadorB.puntajeAcumulado - jugadorA.puntajeAcumulado;
    });

    res.render("ranking", {
        ranking: ranking
    });
});

app.get("/configuracion", (req, res) => {
    res.render("configuracion", {
        mensaje: ""
    });
});

app.post("/reiniciar-historial", (req, res) => {
    escribirPartidas([]);

    res.render("configuracion", {
        mensaje: "El historial fue eliminado correctamente."
    });
});

app.listen(puerto, () => {
    console.log(`Servidor funcionando en http://localhost:${puerto}`);
});
