const formProducto = document.getElementById("formProducto");
const btnProductos = document.getElementById("btnProductos");
const mensaje = document.getElementById("mensaje");
const resultado = document.getElementById("resultado");


async function cargarProductos() {
    try {
        const respuesta = await fetch("/productos");

        const productos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                productos.error || "No fue posible obtener los productos"
            );
        }

        resultado.innerHTML = "";

        productos.forEach(producto => {
            resultado.innerHTML += `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">
                            ${producto.nombre}
                        </h5>

                        <p class="card-text">
                            Precio:
                            $${producto.precio.toLocaleString("es-CL")}
                        </p>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error(error);

        resultado.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}


btnProductos.addEventListener("click", () => {
    cargarProductos();
});


formProducto.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document
        .getElementById("nombre")
        .value
        .trim();

    const precio = Number(
        document.getElementById("precio").value
    );

    try {
        const respuesta = await fetch("/productos", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nombre: nombre,
                precio: precio
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.innerHTML = `
                <div class="alert alert-danger">
                    ${datos.error}
                </div>
            `;

            return;
        }

        mensaje.innerHTML = `
            <div class="alert alert-success">
                ${datos.mensaje}
            </div>
        `;

        formProducto.reset();

        // Volver a consultar los productos
        await cargarProductos();

    } catch (error) {
        console.error(error);

        mensaje.innerHTML = `
            <div class="alert alert-danger">
                No fue posible conectar con el servidor
            </div>
        `;
    }
});