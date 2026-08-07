const alerta = document.getElementById("alerta");
const tablaClientes = document.getElementById("tablaClientes");
const cantidadClientes = document.getElementById("cantidadClientes");

function mostrarAlerta(mensaje, tipo = "success") {
    alerta.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;
}

async function leerRespuesta(respuesta) {
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "La solicitud no pudo completarse.");
    }

    return datos;
}

function mostrarClientes(clientes) {
    cantidadClientes.textContent = `${clientes.length} cliente(s)`;

    if (clientes.length === 0) {
        tablaClientes.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-secondary py-4">
                    No existen clientes registrados.
                </td>
            </tr>
        `;
        return;
    }

    tablaClientes.innerHTML = clientes
        .map((cliente, indice) => `
            <tr>
                <td>${indice + 1}</td>
                <td>${cliente.rut}</td>
                <td class="fw-semibold">${cliente.nombre}</td>
                <td>${cliente.edad}</td>
            </tr>
        `)
        .join("");
}

async function consultarClientes() {
    try {
        const respuesta = await fetch("/clientes");
        const clientes = await leerRespuesta(respuesta);
        mostrarClientes(clientes);
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
}

document.getElementById("formConsultar").addEventListener("submit", async (evento) => {
    evento.preventDefault();
    await consultarClientes();
});

document.getElementById("formCrear").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const rut = document.getElementById("crearRut").value.trim();
    const nombre = document.getElementById("crearNombre").value.trim();
    const edad = document.getElementById("crearEdad").value;

    try {
        const respuesta = await fetch("/clientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ rut, nombre, edad })
        });

        const datos = await leerRespuesta(respuesta);
        mostrarAlerta(datos.mensaje, "success");
        evento.target.reset();
        await consultarClientes();
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
        mostrarAlerta(datos.mensaje, "warning");
        evento.target.reset();
        await consultarClientes();
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formEliminar").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const rut = document.getElementById("eliminarRut").value.trim();

    if (!window.confirm(`¿Eliminar al cliente con RUT ${rut}?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`/clientes/${encodeURIComponent(rut)}`, {
            method: "DELETE"
        });

        const datos = await leerRespuesta(respuesta);
        mostrarAlerta(datos.mensaje, "warning");
        evento.target.reset();
        await consultarClientes();
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
});
