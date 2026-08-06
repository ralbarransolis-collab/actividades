const btnPeliculas = document.getElementById('btnPeliculas');
const btnSeries = document.getElementById('btnSeries');
const ordenarPor = document.getElementById('ordenarPor');
const direccionOrden = document.getElementById('direccionOrden');
const listaCatalogo = document.getElementById('listaCatalogo');
const tituloLista = document.getElementById('tituloLista');
const resultado = document.getElementById('resultado');
const formPelicula = document.getElementById('formPelicula');
const formSerie = document.getElementById('formSerie');

let tipoActual = null;
let catalogoActual = [];

function mostrarMensaje(mensaje, esError = false) {
    resultado.textContent = mensaje;
    resultado.className = esError ? 'mensaje error' : 'mensaje exito';
}

function configurarOpcionesOrden(tipo) {
    ordenarPor.innerHTML = `
        <option value="nombre">Nombre</option>
        <option value="anio">Año</option>
    `;

    if (tipo === 'peliculas') {
        ordenarPor.insertAdjacentHTML(
            'beforeend',
            '<option value="director">Director</option>'
        );
    }
    else {
        ordenarPor.insertAdjacentHTML(
            'beforeend',
            '<option value="temporadas">Número de temporadas</option>'
        );
    }

    ordenarPor.disabled = false;
    direccionOrden.disabled = false;
}

function ordenarCatalogo() {
    const criterio = ordenarPor.value;
    const direccion = direccionOrden.value;

    const registrosOrdenados = [...catalogoActual].sort((a, b) => {
        const valorA = a[criterio];
        const valorB = b[criterio];

        let comparacion;

        if (typeof valorA === 'number' && typeof valorB === 'number') {
            comparacion = valorA - valorB;
        }
        else {
            comparacion = String(valorA).localeCompare(
                String(valorB),
                'es',
                { sensitivity: 'base' }
            );
        }

        return direccion === 'asc' ? comparacion : -comparacion;
    });

    mostrarCatalogo(registrosOrdenados);
}

function mostrarCatalogo(registros) {
    listaCatalogo.innerHTML = '';

    if (registros.length === 0) {
        listaCatalogo.innerHTML = '<p class="sin-resultados">No hay registros disponibles.</p>';
        return;
    }

    registros.forEach(registro => {
        const articulo = document.createElement('article');
        articulo.className = 'tarjeta';

        const detalles = tipoActual === 'peliculas'
            ? `<p><strong>Director:</strong> ${registro.director}</p>`
            : `<p><strong>Temporadas:</strong> ${registro.temporadas}</p>`;

        articulo.innerHTML = `
            <div>
                <h3>${registro.nombre}</h3>
                ${detalles}
                <p><strong>Año:</strong> ${registro.anio}</p>
            </div>
            <button
                type="button"
                class="btn-eliminar"
                data-nombre="${registro.nombre}"
            >
                Eliminar
            </button>
        `;

        listaCatalogo.appendChild(articulo);
    });
}

async function cargarCatalogo(tipo) {
    try {
        const respuesta = await fetch(`/api/catalogo?tipo=${tipo}`);
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'No fue posible cargar el catálogo.');
        }

        tipoActual = tipo;
        catalogoActual = datos;
        tituloLista.textContent = tipo === 'peliculas'
            ? 'Lista de películas'
            : 'Lista de series';

        configurarOpcionesOrden(tipo);
        ordenarCatalogo();
        mostrarMensaje('Catálogo cargado correctamente.');
    }
    catch (error) {
        mostrarMensaje(error.message, true);
    }
}

async function agregarRegistro(tipo, datos) {
    const respuesta = await fetch(`/api/catalogo?tipo=${tipo}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    });

    const respuestaJson = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(respuestaJson.mensaje || 'No fue posible agregar el registro.');
    }

    mostrarMensaje(respuestaJson.mensaje);
    await cargarCatalogo(tipo);
}

async function eliminarRegistro(nombre) {
    try {
        const respuesta = await fetch(
            `/api/catalogo/${encodeURIComponent(nombre)}?tipo=${tipoActual}`,
            { method: 'DELETE' }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'No fue posible eliminar el registro.');
        }

        mostrarMensaje(datos.mensaje);
        await cargarCatalogo(tipoActual);
    }
    catch (error) {
        mostrarMensaje(error.message, true);
    }
}

btnPeliculas.addEventListener('click', () => {
    cargarCatalogo('peliculas');
});

btnSeries.addEventListener('click', () => {
    cargarCatalogo('series');
});

ordenarPor.addEventListener('change', ordenarCatalogo);
direccionOrden.addEventListener('change', ordenarCatalogo);

formPelicula.addEventListener('submit', async evento => {
    evento.preventDefault();

    const pelicula = {
        nombre: document.getElementById('nombrePelicula').value.trim(),
        director: document.getElementById('directorPelicula').value.trim(),
        anio: Number(document.getElementById('anioPelicula').value)
    };

    try {
        await agregarRegistro('peliculas', pelicula);
        formPelicula.reset();
    }
    catch (error) {
        mostrarMensaje(error.message, true);
    }
});

formSerie.addEventListener('submit', async evento => {
    evento.preventDefault();

    const serie = {
        nombre: document.getElementById('nombreSerie').value.trim(),
        anio: Number(document.getElementById('anioSerie').value),
        temporadas: Number(document.getElementById('temporadasSerie').value)
    };

    try {
        await agregarRegistro('series', serie);
        formSerie.reset();
    }
    catch (error) {
        mostrarMensaje(error.message, true);
    }
});

listaCatalogo.addEventListener('click', evento => {
    const boton = evento.target.closest('.btn-eliminar');

    if (!boton || !tipoActual) {
        return;
    }

    eliminarRegistro(boton.dataset.nombre);
});
