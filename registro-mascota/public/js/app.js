const tablaMascotas = document.getElementById('tablaMascotas');
const alerta = document.getElementById('alerta');

function mostrarAlerta(mensaje, tipo = 'success') {
    alerta.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        </div>
    `;
}

function obtenerMensajeError(error) {
    if (error.response?.data?.mensaje) {
        return error.response.data.mensaje;
    }

    if (error.request) {
        return 'No fue posible comunicarse con el servidor.';
    }

    return error.message || 'Ocurrió un error inesperado.';
}

function normalizarRespuesta(datos) {
    return Array.isArray(datos) ? datos : [datos];
}

function mostrarMascotas(datos) {
    const mascotas = normalizarRespuesta(datos);

    if (mascotas.length === 0) {
        tablaMascotas.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-secondary py-4">
                    No existen mascotas registradas.
                </td>
            </tr>
        `;
        return;
    }

    tablaMascotas.innerHTML = mascotas
        .map((mascota, indice) => `
            <tr>
                <td>${indice + 1}</td>
                <td class="fw-semibold">${mascota.nombre}</td>
                <td>${mascota.categoria || 'Sin categoría'}</td>
                <td>${mascota.rut}</td>
            </tr>
        `)
        .join('');
}

async function listarTodas() {
    try {
        const respuesta = await axios.get('/api/mascotas');
        mostrarMascotas(respuesta.data);
    }
    catch (error) {
        mostrarAlerta(obtenerMensajeError(error), 'danger');
    }
}

document.getElementById('btnListarTodas').addEventListener('click', listarTodas);

document.getElementById('formBuscarNombre').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById('buscarNombre').value.trim();

    try {
        const respuesta = await axios.get('/api/mascotas', {
            params: { nombre }
        });

        mostrarMascotas(respuesta.data);
    }
    catch (error) {
        mostrarAlerta(obtenerMensajeError(error), 'danger');
    }
});

document.getElementById('formBuscarCategoria').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const categoria = document.getElementById('buscarCategoria').value.trim();

    try {
        const respuesta = await axios.get('/api/mascotas', {
            params: { categoria }
        });

        mostrarMascotas(respuesta.data);
    }
    catch (error) {
        mostrarAlerta(obtenerMensajeError(error), 'danger');
    }
});

document.getElementById('formBuscarRut').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const rut = document.getElementById('buscarRut').value.trim();

    try {
        const respuesta = await axios.get('/api/mascotas', {
            params: { rut }
        });

        mostrarMascotas(respuesta.data);
    }
    catch (error) {
        mostrarAlerta(obtenerMensajeError(error), 'danger');
    }
});

document.getElementById('formAgregar').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const rut = document.getElementById('rut').value.trim();

    try {
        const respuesta = await axios.post('/api/mascotas', {
            nombre,
            categoria,
            rut
        });

        mostrarAlerta(respuesta.data.mensaje, 'success');
        evento.target.reset();
        await listarTodas();
    }
    catch (error) {
        mostrarAlerta(obtenerMensajeError(error), 'danger');
    }
});

document.getElementById('formEliminarNombre').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById('eliminarNombre').value.trim();

    if (!window.confirm(`¿Eliminar la mascota ${nombre}?`)) {
        return;
    }

    try {
        const respuesta = await axios.delete('/api/mascotas', {
            params: { nombre }
        });

        mostrarAlerta(respuesta.data.mensaje, 'warning');
        evento.target.reset();
        await listarTodas();
    }
    catch (error) {
        mostrarAlerta(obtenerMensajeError(error), 'danger');
    }
});

document.getElementById('formEliminarRut').addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const rut = document.getElementById('eliminarRut').value.trim();

    if (!window.confirm(`¿Eliminar todas las mascotas asociadas al RUT ${rut}?`)) {
        return;
    }

    try {
        const respuesta = await axios.delete('/api/mascotas', {
            params: { rut }
        });

        mostrarAlerta(respuesta.data.mensaje, 'warning');
        evento.target.reset();
        await listarTodas();
    }
    catch (error) {
        mostrarAlerta(obtenerMensajeError(error), 'danger');
    }
});

listarTodas();
