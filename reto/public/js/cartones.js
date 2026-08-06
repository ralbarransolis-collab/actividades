const contenedorCartones = document.getElementById('contenedorCartones');
const mensaje = document.getElementById('mensaje');
const btnActualizar = document.getElementById('btnActualizar');

function crearTablaNumeros(numeros) {
    const filas = [];

    for (let i = 0; i < numeros.length; i += 3) {
        const grupo = numeros.slice(i, i + 3);
        const celdas = grupo
            .map(numero => `<td>${numero}</td>`)
            .join('');

        filas.push(`<tr>${celdas}</tr>`);
    }

    return `
        <table class="table table-bordered table-sm text-center mb-0 tabla-carton">
            <tbody>${filas.join('')}</tbody>
        </table>
    `;
}

function crearTarjetaCarton(carton) {
    return `
        <div class="col-sm-6 col-lg-4 col-xl-3">
            <article class="card h-100 border-1 shadow-sm carton">
                <div class="card-header bg-primary text-white fw-semibold">
                    Número de serie: ${carton.serie}
                </div>
                <div class="card-body">
                    ${crearTablaNumeros(carton.numeros)}
                </div>
            </article>
        </div>
    `;
}

async function cargarCartones() {
    mensaje.innerHTML = `
        <div class="alert alert-info">Cargando cartones...</div>
    `;
    contenedorCartones.innerHTML = '';

    try {
        const respuesta = await fetch('/api/cartones');

        if (!respuesta.ok) {
            throw new Error('No fue posible obtener los cartones.');
        }

        const cartones = await respuesta.json();

        mensaje.innerHTML = `
            <div class="alert alert-success">
                Se encontraron ${cartones.length} cartones.
            </div>
        `;

        contenedorCartones.innerHTML = cartones
            .map(crearTarjetaCarton)
            .join('');
    }
    catch (error) {
        mensaje.innerHTML = `
            <div class="alert alert-danger">${error.message}</div>
        `;
    }
}

btnActualizar.addEventListener('click', cargarCartones);

document.addEventListener('DOMContentLoaded', cargarCartones);
