const alerta = document.getElementById("alerta");
const tablaClientes = document.getElementById("tablaClientes");
const resumenResultados = document.getElementById("resumenResultados");

function mostrarAlerta(mensaje, tipo = "success") {
    alerta.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function limpiarAlerta() {
    alerta.innerHTML = "";
}

function normalizarClientes(datos) {
    if (Array.isArray(datos)) {
        return datos;
    }

    if (datos?.cliente) {
        return [datos.cliente];
    }

    if (Array.isArray(datos?.clientes)) {
        return datos.clientes;
    }

    return [];
}

function mostrarClientes(datos) {
    const clientes = normalizarClientes(datos)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    resumenResultados.textContent = `${clientes.length} cliente(s) encontrado(s).`;

    if (clientes.length === 0) {
        tablaClientes.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-secondary py-4">
                    No hay clientes para mostrar.
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

async function solicitar(url, opciones = {}) {
    const respuesta = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(opciones.headers || {})
        },
        ...opciones
    });

    const tipoContenido = respuesta.headers.get("content-type") || "";
    const datos = tipoContenido.includes("application/json")
        ? await respuesta.json()
        : { mensaje: await respuesta.text() };

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "La solicitud no pudo completarse.");
    }

    return datos;
}

async function listarTodos() {
    try {
        limpiarAlerta();
        const datos = await solicitar("/clientes");
        mostrarClientes(datos);
    }
    catch (error) {
        mostrarClientes([]);
        mostrarAlerta(error.message, "danger");
    }
}

document.getElementById("btnListarTodos").addEventListener("click", listarTodos);

document.getElementById("formCrear").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const rut = document.getElementById("crearRut").value.trim();
    const nombre = document.getElementById("crearNombre").value.trim();
    const edad = document.getElementById("crearEdad").value;

    try {
        const datos = await solicitar("/clientes", {
            method: "POST",
            body: JSON.stringify({ rut, nombre, edad })
        });

        mostrarAlerta(datos.mensaje, "success");
        evento.target.reset();
        mostrarClientes(datos);
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
        const datos = await solicitar(`/clientes/${encodeURIComponent(rut)}`, {
            method: "PUT",
            body: JSON.stringify({ nombre })
        });

        mostrarAlerta(datos.mensaje, "success");
        evento.target.reset();
        mostrarClientes(datos);
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formEliminarRut").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const rut = document.getElementById("eliminarRut").value.trim();

    if (!window.confirm(`¿Eliminar al cliente con RUT ${rut}?`)) {
        return;
    }

    try {
        const datos = await solicitar(`/clientes/${encodeURIComponent(rut)}`, {
            method: "DELETE"
        });

        mostrarAlerta(datos.mensaje, "warning");
        evento.target.reset();
        await listarTodos();
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
});

function registrarConsultaFormulario(idFormulario, construirUrl) {
    document.getElementById(idFormulario).addEventListener("submit", async (evento) => {
        evento.preventDefault();

        try {
            limpiarAlerta();
            const datos = await solicitar(construirUrl());
            mostrarClientes(datos);
        }
        catch (error) {
            mostrarClientes([]);
            mostrarAlerta(error.message, "danger");
        }
    });
}

registrarConsultaFormulario("formConsultarRut", () => {
    const rut = document.getElementById("consultarRut").value.trim();
    return `/clientes?rut=${encodeURIComponent(rut)}`;
});

registrarConsultaFormulario("formConsultarEdad", () => {
    const edad = document.getElementById("consultarEdad").value;
    return `/clientes?edad=${encodeURIComponent(edad)}`;
});

registrarConsultaFormulario("formConsultarRango", () => {
    const edadMin = document.getElementById("consultarEdadMin").value;
    const edadMax = document.getElementById("consultarEdadMax").value;
    return `/clientes?edadMin=${encodeURIComponent(edadMin)}&edadMax=${encodeURIComponent(edadMax)}`;
});

registrarConsultaFormulario("formConsultarNombre", () => {
    const nombre = document.getElementById("consultarNombre").value.trim();
    return `/clientes?nombre=${encodeURIComponent(nombre)}`;
});

document.getElementById("formEliminarEdad").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const edad = document.getElementById("eliminarEdad").value;

    if (!window.confirm(`¿Eliminar a todos los clientes de ${edad} años?`)) {
        return;
    }

    try {
        const datos = await solicitar(`/clientes?edad=${encodeURIComponent(edad)}`, {
            method: "DELETE"
        });

        mostrarAlerta(
            `${datos.mensaje} Nombres: ${datos.nombresEliminados.join(", ")}`,
            "warning"
        );

        evento.target.reset();
        await listarTodos();
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
});

document.getElementById("formEliminarRango").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const edadMin = document.getElementById("eliminarEdadMin").value;
    const edadMax = document.getElementById("eliminarEdadMax").value;

    if (!window.confirm(`¿Eliminar clientes entre ${edadMin} y ${edadMax} años?`)) {
        return;
    }

    try {
        const datos = await solicitar(
            `/clientes?edadMin=${encodeURIComponent(edadMin)}&edadMax=${encodeURIComponent(edadMax)}`,
            { method: "DELETE" }
        );

        mostrarAlerta(
            `${datos.mensaje} Nombres: ${datos.nombresEliminados.join(", ")}`,
            "warning"
        );

        evento.target.reset();
        await listarTodos();
    }
    catch (error) {
        mostrarAlerta(error.message, "danger");
    }
});
