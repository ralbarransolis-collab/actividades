const express = require("express");

const app = express();

const puerto = 3000;


function completarDosDigitos(valor) {
    return String(valor).padStart(2, "0");
}

function generarPalabraAleatoria() {

    const letras = "abcdefghijklmnopqrstuvwxyz";

    const minimoLetras = 3;
    const maximoLetras = 10;

    const longitudPalabra =
        Math.floor(
            Math.random() * (maximoLetras - minimoLetras + 1)
        ) + minimoLetras;

    let palabra = "";

    for (let i = 0; i < longitudPalabra; i++) {

        const posicionAleatoria =
            Math.floor(Math.random() * letras.length);

        palabra = palabra + letras[posicionAleatoria];
    }

    return palabra;
}

app.get("/", (req, res) => {

    const fechaActual = new Date();

    const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ];

    const nombreDia = diasSemana[fechaActual.getDay()];

    const numeroDia = fechaActual.getDate();

    const numeroMes = fechaActual.getMonth() + 1;

    const anio = fechaActual.getFullYear();

    const hora = completarDosDigitos(
        fechaActual.getHours()
    );

    const minutos = completarDosDigitos(
        fechaActual.getMinutes()
    );

    const segundos = completarDosDigitos(
        fechaActual.getSeconds()
    );

    res.status(200);

    res.set(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.send(`
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0">

            <link
             href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
            rel="stylesheet"
            >
            <script
                defer
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js">
            </script>

            <title>Fecha y hora del servidor</title>

        </head>



    <header class="bg-dark text-white text-center py-4">
        <h1 class="mb-0">Fecha y hora actual del servidor</h1>
    </header>
        <body class="bg-light min-vh-100 d-flex flex-column">
    
            <main class="container flex-grow-1">

                <div class="row justify-content-center">

                    <div class="col-md-8">

                        <div class="card shadow-lg mt-4 mb-4">

                            <div class="card-body bg-white rounded text-center">

                                <p>
                                    <strong>Día:</strong>
                                    ${nombreDia}
                                </p>

                                <p>
                                    <strong>Número del día:</strong>
                                    ${numeroDia}
                                </p>

                                <p>
                                    <strong>Mes:</strong>
                                    ${numeroMes}
                                </p>

                                <p>
                                    <strong>Año:</strong>
                                    ${anio}
                                </p>

                                <p>
                                    <strong>Hora:</strong>
                                    ${hora}
                                </p>

                                <p>
                                    <strong>Minutos:</strong>
                                    ${minutos}
                                </p>

                                <p>
                                    <strong>Segundos:</strong>
                                    ${segundos}
                                </p>

                                <div class="alert alert-primary mt-4">

                                    <strong>Hora completa:</strong>

                                    <span class="fs-4">
                                        ${hora}:${minutos}:${segundos}
                                    </span>

                                </div>

                                <hr>

                                <a
                                    href="/random-data"
                                    class="btn btn-primary"
                                >
                                    Ir a respuestas aleatorias
                                </a>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </body>

        </html>
    `);
});


app.all("/random-data", (req, res, next) => {

    if (
        req.method === "GET" ||
        req.method === "PUT"
    ) {
        return next();
    }

    const mensaje =
        `Aún no estoy preparado para responder al método ${req.method}`;

    res.status(501);

    res.set(
        "Content-Type",
        "text/plain; charset=utf-8"
    );

    res.send(mensaje);
});


app.get("/random-data", (req, res) => {

    const palabraAleatoria =
        generarPalabraAleatoria();

    res.status(200);

    res.set(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.send(`
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>Palabra aleatoria</title>
            <link
             href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
            rel="stylesheet"
            >
            <script
                defer
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js">
            </script>

        </head>

        <body>
            <header class="bg-dark text-white text-center py-4">
            <h1>Palabra aleatoria</h1>
            </header>
           
            <main class="container flex-grow-1">

                <div class="row justify-content-center">

                    <div class="col-md-8">

                        <div class="card shadow-lg mt-4 mb-4">

                            <div class="card-body bg-white rounded text-center">

                                <p>
                                    La palabra generada es:
                                    <strong>${palabraAleatoria}</strong>
                                </p>

                                <p>
                                    Cantidad de letras:
                                    ${palabraAleatoria.length}
                                </p>

                                <button id="botonPut" class= "btn btn-success">
                                    Generar número entre 50 a 50.000
                                </button>

                                <br><br>

                                <a href="/" class= "btn btn-primary">
                                    Volver a la fecha y hora
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <script>

                    const botonPut =
                        document.getElementById("botonPut");

                    botonPut.addEventListener("click", async () => {

                        const respuesta = await fetch(
                            "/random-data",
                            {
                                method: "PUT"
                            }
                        );

                        const contenido =
                            await respuesta.text();

                        document.open();
                        document.write(contenido);
                        document.close();
                    });

                </script>
            </main>
        </body>

        </html>
    `);
});


app.put("/random-data", (req, res) => {

    const minimo = 10;
    const maximo = 50000;

    const numeroAleatorio =
        Math.floor(
            Math.random() * (maximo - minimo + 1)
        ) + minimo;

    res.status(200);

    res.set(
        "Content-Type",
        "text/html; charset=utf-8"
    );

    res.send(`
        <!DOCTYPE html>
        <html lang="es">

        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>Número aleatorio</title>

            <link
             href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
            rel="stylesheet"
            >
            <script
                defer
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js">
            </script>

        </head>

        <body>
             <header class="bg-dark text-white text-center py-4">
            <h1>Número aleatorio</h1>
            </header>
             <main class="container flex-grow-1">

                <div class="row justify-content-center">

                    <div class="col-md-8">

                        <div class="card shadow-lg mt-4 mb-4">

                            <div class="card-body bg-white rounded text-center">

                                <p>
                                    El número generado es:
                                    <strong>
                                        ${numeroAleatorio.toLocaleString("es-CL")}
                                    </strong>
                                </p>

                                <button onclick="volver()" class="btn btn-primary">
                                    Volver a palabra aleatoria
                                </button>

                                <script>

                                    function volver() {
                                        window.location.href = "/random-data";
                                    }
                                 </script>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
           

        </body>

        </html>
    `);
});

app.use((req, res) => {

    res.status(404);

    res.set(
        "Content-Type",
        "text/plain; charset=utf-8"
    );

    res.send("Ruta no encontrada");
});


app.listen(puerto, () => {

    console.log(
        `Servidor en funcionamiento: http://localhost:${puerto}`
    );
});