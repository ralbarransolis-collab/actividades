const resultado = document.getElementById("resultado");
const tituloResultado = document.getElementById("tituloResultado");
const estado = document.getElementById("estado");

function escaparHtml(valor) {
    return String(valor ?? "").replace(/[&<>'"]/g, (caracter) => {
        const equivalencias = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        };

        return equivalencias[caracter];
    });
}

function mostrarCargando(titulo) {
    tituloResultado.textContent = titulo;
    estado.className = "badge text-bg-info";
    estado.textContent = "Consultando";

    resultado.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <div class="spinner-border spinner-border-sm" role="status"></div>
            <span>Obteniendo información...</span>
        </div>
    `;
}

function mostrarError(mensaje) {
    estado.className = "badge text-bg-danger";
    estado.textContent = "Error";

    resultado.innerHTML = `
        <div class="alert alert-danger mb-0">
            ${escaparHtml(mensaje)}
        </div>
    `;
}

function mostrarSinResultados() {
    estado.className = "badge text-bg-warning";
    estado.textContent = "Sin resultados";

    resultado.innerHTML = `
        <div class="alert alert-warning mb-0">
            La consulta no encontró registros.
        </div>
    `;
}

async function consultar(url) {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.error || "Ocurrió un error en la consulta");
    }

    return datos;
}

function mostrarTabla(columnas, filas) {
    if (!filas.length) {
        mostrarSinResultados();
        return;
    }

    const encabezados = columnas
        .map((columna) => `<th>${escaparHtml(columna.titulo)}</th>`)
        .join("");

    const contenido = filas
        .map((fila) => {
            const celdas = columnas
                .map((columna) => {
                    const valor = fila[columna.campo];
                    const texto = valor === null || valor === undefined ? "Sin información" : valor;
                    return `<td>${escaparHtml(texto)}</td>`;
                })
                .join("");

            return `<tr>${celdas}</tr>`;
        })
        .join("");

    estado.className = "badge text-bg-success";
    estado.textContent = `${filas.length} resultado(s)`;

    resultado.innerHTML = `
        <table class="table table-striped table-hover align-middle mb-0">
            <thead class="table-dark">
                <tr>${encabezados}</tr>
            </thead>
            <tbody>${contenido}</tbody>
        </table>
    `;
}

document.getElementById("btnConductores").addEventListener("click", async () => {
    mostrarCargando("Lista de conductores");

    try {
        const datos = await consultar("/conductores");

        mostrarTabla(
            [
                { campo: "nombre", titulo: "Nombre" },
                { campo: "edad", titulo: "Edad" }
            ],
            datos
        );
    } catch (error) {
        mostrarError(error.message);
    }
});

document.getElementById("btnAutomoviles").addEventListener("click", async () => {
    mostrarCargando("Lista de automóviles");

    try {
        const datos = await consultar("/automoviles");

        mostrarTabla(
            [
                { campo: "marca", titulo: "Marca" },
                { campo: "patente", titulo: "Patente" },
                { campo: "nombre_conductor", titulo: "Conductor asignado" }
            ],
            datos
        );
    } catch (error) {
        mostrarError(error.message);
    }
});

document.getElementById("btnSolitos").addEventListener("click", async () => {
    mostrarCargando("Conductores y automóviles sin relación");

    try {
        const datos = await consultar("/solitos");

        mostrarTabla(
            [
                { campo: "tipo", titulo: "Tipo" },
                { campo: "nombre_conductor", titulo: "Nombre del conductor" },
                { campo: "edad", titulo: "Edad" },
                { campo: "marca", titulo: "Marca" },
                { campo: "patente", titulo: "Patente" }
            ],
            datos
        );
    } catch (error) {
        mostrarError(error.message);
    }
});

document.getElementById("formEdad").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const edad = document.getElementById("edad").value;
    mostrarCargando(`Conductores sin automóvil menores de ${edad} años`);

    try {
        const datos = await consultar(
            `/conductoressinauto?edad=${encodeURIComponent(edad)}`
        );

        mostrarTabla(
            [
                { campo: "nombre", titulo: "Nombre" },
                { campo: "edad", titulo: "Edad" }
            ],
            datos
        );
    } catch (error) {
        mostrarError(error.message);
    }
});

document.getElementById("formPatente").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const patente = document.getElementById("patente").value.trim();
    mostrarCargando(`Automóvil con patente ${patente.toUpperCase()}`);

    try {
        const dato = await consultar(
            `/auto?patente=${encodeURIComponent(patente)}`
        );

        mostrarTabla(
            [
                { campo: "marca", titulo: "Marca" },
                { campo: "patente", titulo: "Patente" },
                { campo: "nombre_conductor", titulo: "Conductor asignado" },
                { campo: "edad_conductor", titulo: "Edad del conductor" }
            ],
            [dato]
        );
    } catch (error) {
        mostrarError(error.message);
    }
});

document.getElementById("formInicioPatente").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const letra = document.getElementById("inicioPatente").value.trim();
    mostrarCargando(`Patentes que comienzan con ${letra.toUpperCase()}`);

    try {
        const datos = await consultar(
            `/auto?iniciopatente=${encodeURIComponent(letra)}`
        );

        mostrarTabla(
            [
                { campo: "marca", titulo: "Marca" },
                { campo: "patente", titulo: "Patente" },
                { campo: "nombre_conductor", titulo: "Conductor asignado" },
                { campo: "edad_conductor", titulo: "Edad del conductor" }
            ],
            datos
        );
    } catch (error) {
        mostrarError(error.message);
    }
});
