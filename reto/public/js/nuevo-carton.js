const btnCrear = document.getElementById('btnCrear');
const mensaje = document.getElementById('mensaje');
const resultado = document.getElementById('resultado');

function crearTablaNumeros(numeros) {
    const filas = [];

    for (let i = 0; i < numeros.length; i += 3) {
        const grupo = numeros.slice(i, i + 3);
        filas.push(`
            <tr>
                ${grupo.map(numero => `<td>${numero}</td>`).join('')}
            </tr>
        `);
    }

    return `
        <table class="table table-bordered text-center mb-0 tabla-carton">
            <tbody>${filas.join('')}</tbody>
        </table>
    `;
}

async function crearCarton() {
    btnCrear.disabled = true;
    mensaje.innerHTML = '<div class="alert alert-info">Generando cartón...</div>';
    resultado.innerHTML = '';

    try {
        const respuesta = await fetch('/api/cartones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || 'No fue posible crear el cartón.');
        }

        mensaje.innerHTML = `
            <div class="alert alert-success">${datos.mensaje}</div>
        `;

        resultado.innerHTML = `
            <article class="card border-success shadow-sm mx-auto carton carton-destacado">
                <div class="card-header bg-success text-white fw-semibold">
                    Número de serie: ${datos.carton.serie}
                </div>
                <div class="card-body">
                    ${crearTablaNumeros(datos.carton.numeros)}
                </div>
            </article>
        `;
    }
    catch (error) {
        mensaje.innerHTML = `
            <div class="alert alert-danger">${error.message}</div>
        `;
    }
    finally {
        btnCrear.disabled = false;
    }
}

btnCrear.addEventListener('click', crearCarton);
