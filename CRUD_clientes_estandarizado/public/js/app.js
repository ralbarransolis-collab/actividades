const tablaClientes = document.getElementById("tablaClientes");
const alerta = document.getElementById("alerta");

function escaparHtml(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function mostrarAlerta(mensaje, tipo = "success") {
    alerta.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${escaparHtml(mensaje)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;
}

async function leerRespuesta(respuesta) {
    let datos;

    try {
        datos = await respuesta.json();
    }
    catch (error) {
        throw new Error("El servidor no devolvió una respuesta JSON válida.");
    }

    if (!respuesta.ok || datos.ok === false) {
        const error = new Error(datos.mensaje || "La operación no pudo completarse.");
        error.data = datos;
        throw error;
    }

    return datos;
}

function mostrarClientes(clientes) {
    const lista = Array.isArray(clientes)
        ? clientes
        : clientes
            ? [clientes]
            : [];

    if (lista.length === 0) {
        tablaClientes.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-secondary py-4">
                    No existen clientes para mostrar.
                </td>
            </tr>
        `;
        return;
    }

    tablaClientes.innerHTML = lista
        .map((cliente, indice) => `
            <tr>
                <td>${indice + 1}</td>
                <td>${escaparHtml(cliente.rut)}</td>
                <td class="fw-semibold">${escaparHtml(cliente.nombre)}</td>
                <td>${escaparHtml(cliente.edad)}</td>
            </tr>
        `)
        .join("");
}

async function consultar(url) {
    const respuesta = await fetch(url);
    const datos = await leerRespuesta(respuesta);
    mostrarClientes(datos.data);
    return datos;
}

async function listarTodos() {
    try {
        await consultar("/clientes");
        mostrarAlerta("Clientes cargados correctamente.", "success");
    }
    catch (error) {
        mostrarClientes(error.data?.data || []);
        mostrarAlerta(error.message, "danger");
    }
}

document.getElementById("btnListar").addEventListener("click", listarTodos);

document.getElementById("formCrear").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const rut = document.getElementById("crearRut").value.trim();
    const nombre = document.getElementById("crearNombre").value.trim();
    const edad = document.getElementById("crearEdad").value.trim();

    try {
        const respuesta = await fetch("/clientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rut, nombre, edad })
        });

        const datos = await leerRespuesta(respuesta);
        mostrarClientes(datos.data);
        mostrarAlerta("Cliente creado correctamente.", "success");
        evento.target.reset();
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formModificar").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const rut = document.getElementById("modificarRut").value.trim();
    const nombre = document.getElementById("modificarNombre").value.trim();

    try {
        const respuesta = await fetch(`/clientes/${encodeURIComponent(rut)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre })
        });

        const datos = await leerRespuesta(respuesta);
        mostrarClientes(datos.data);
        mostrarAlerta(`${datos.mensaje}. rowCount: ${datos.rowCount}`, "success");
        evento.target.reset();
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formConsultarRut").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const rut = document.getElementById("consultarRut").value.trim();

    try {
        await consultar(`/clientes?rut=${encodeURIComponent(rut)}`);
        mostrarAlerta("Consulta realizada correctamente.", "success");
    }
    catch (error) {
        mostrarClientes([]);
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formConsultarNombre").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const nombre = document.getElementById("consultarNombre").value.trim();

    try {
        await consultar(`/clientes?nombre=${encodeURIComponent(nombre)}`);
        mostrarAlerta("Consulta realizada correctamente.", "success");
    }
    catch (error) {
        mostrarClientes([]);
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formConsultarEdad").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const edad = document.getElementById("consultarEdad").value.trim();

    try {
        await consultar(`/clientes?edad=${encodeURIComponent(edad)}`);
        mostrarAlerta("Consulta realizada correctamente.", "success");
    }
    catch (error) {
        mostrarClientes([]);
        mostrarAlerta(error.message, "danger");
    }
});

async function eliminarPorCriterio(parametro, valor) {
    const respuesta = await fetch(
        `/clientes?${parametro}=${encodeURIComponent(valor)}`,
        { method: "DELETE" }
    );

    return leerRespuesta(respuesta);
}

document.getElementById("formEliminarRut").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const rut = document.getElementById("eliminarRut").value.trim();

    if (!window.confirm(`¿Eliminar al cliente con RUT ${rut}?`)) {
        return;
    }

    try {
        const datos = await eliminarPorCriterio("rut", rut);
        mostrarClientes(datos.data);
        mostrarAlerta(`${datos.mensaje}. rowCount: ${datos.rowCount}`, "warning");
        evento.target.reset();
    }
    catch (error) {
        if (error.data?.data) {
            mostrarClientes(error.data.data);
        }
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formEliminarNombre").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const nombre = document.getElementById("eliminarNombre").value.trim();

    if (!window.confirm(`¿Eliminar al cliente que coincida con “${nombre}”?`)) {
        return;
    }

    try {
        const datos = await eliminarPorCriterio("nombre", nombre);
        mostrarClientes(datos.data);
        mostrarAlerta(`${datos.mensaje}. rowCount: ${datos.rowCount}`, "warning");
        evento.target.reset();
    }
    catch (error) {
        if (error.data?.data) {
            mostrarClientes(error.data.data);
        }
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formEliminarEdad").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const edad = document.getElementById("eliminarEdad").value.trim();

    if (!window.confirm(`¿Eliminar al cliente de ${edad} años?`)) {
        return;
    }

    try {
        const datos = await eliminarPorCriterio("edad", edad);
        mostrarClientes(datos.data);
        mostrarAlerta(`${datos.mensaje}. rowCount: ${datos.rowCount}`, "warning");
        evento.target.reset();
    }
    catch (error) {
        if (error.data?.data) {
            mostrarClientes(error.data.data);
        }
        mostrarAlerta(error.message, "danger");
    }
});
