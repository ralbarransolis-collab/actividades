const listaClientes =
    document.getElementById("listaClientes");

const mensaje =
    document.getElementById("mensaje");

const btnCargarClientes =
    document.getElementById("btnCargarClientes");

function mostrarError(texto) {
    mensaje.innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${texto}
        </div>
    `;
}

function mostrarClientes(clientes) {
    if (clientes.length === 0) {
        listaClientes.innerHTML = `
            <div class="list-group-item text-secondary">
                No existen clientes registrados.
            </div>
        `;

        return;
    }

    listaClientes.innerHTML = clientes
        .map((cliente) => `
            <article class="list-group-item list-group-item-action">
                <div
                    class="d-flex w-100 justify-content-between
                           align-items-start gap-3"
                >
                    <div>
                        <h3 class="h5 mb-1">
                            ${cliente.nombre}
                        </h3>

                        <p class="mb-1">
                            <strong>Correo:</strong>
                            ${cliente.correo}
                        </p>

                        <p class="mb-1">
                            <strong>Teléfono:</strong>
                            ${cliente.telefono || "Sin teléfono"}
                        </p>

                        <p class="mb-0">
                            <strong>Ciudad:</strong>
                            ${cliente.ciudad || "Sin ciudad"}
                        </p>
                    </div>

                    <span class="badge text-bg-primary">
                        ID ${cliente.id}
                    </span>
                </div>
            </article>
        `)
        .join("");
}

async function cargarClientes() {
    try {
        mensaje.innerHTML = "";

        listaClientes.innerHTML = `
            <div class="list-group-item text-secondary">
                Cargando clientes...
            </div>
        `;

        const respuesta = await fetch(
            "/api/clientes"
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje ||
                "No fue posible consultar los clientes"
            );
        }

        mostrarClientes(datos);
    }
    catch (error) {
        listaClientes.innerHTML = "";

        mostrarError(error.message);
    }
}

btnCargarClientes.addEventListener(
    "click",
    cargarClientes
);

//cargarClientes();