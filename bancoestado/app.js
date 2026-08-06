const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const puerto = process.env.PORT || 3000;

const rutaClientes = path.join(__dirname, 'data', 'clientes.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

async function leerClientes() {
    const contenido = await fs.readFile(rutaClientes, 'utf-8');
    return JSON.parse(contenido);
}

async function guardarClientes(clientes) {
    const contenido = JSON.stringify(clientes, null, 2);
    await fs.writeFile(rutaClientes, contenido, 'utf-8');
}

function normalizarTexto(valor) {
    return String(valor ?? '').trim();
}

function normalizarRut(rut) {
    return normalizarTexto(rut).replace(/\./g, '').toUpperCase();
}

function convertirSaldo(valor) {
    const saldo = Number(valor);
    return Number.isFinite(saldo) && saldo >= 0 ? saldo : null;
}

function buscarCliente(clientes, rut) {
    const rutNormalizado = normalizarRut(rut);
    return clientes.find(cliente => normalizarRut(cliente.rut) === rutNormalizado);
}

function numeroCuentaExiste(clientes, numero) {
    const numeroNormalizado = normalizarTexto(numero).toLowerCase();

    return clientes.some(cliente => {
        const existeCuentaRut = cliente.cuentaRut &&
            normalizarTexto(cliente.cuentaRut.numero).toLowerCase() === numeroNormalizado;

        const existeCuentaAhorro = cliente.cuentasAhorro.some(cuenta =>
            normalizarTexto(cuenta.numero).toLowerCase() === numeroNormalizado
        );

        return existeCuentaRut || existeCuentaAhorro;
    });
}

function redirigirConMensaje(res, tipo, mensaje, destino = '/') {
    const parametros = new URLSearchParams({ [tipo]: mensaje });
    res.redirect(`${destino}?${parametros.toString()}`);
}

app.get('/', async (req, res) => {
    try {
        const clientes = await leerClientes();

        res.render('index', {
            titulo: 'Administración de clientes',
            clientes,
            filtro: 'todos',
            mensaje: req.query.mensaje || '',
            error: req.query.error || ''
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error del servidor',
            mensaje: 'No fue posible leer el archivo de clientes.'
        });
    }
});

app.get('/clientes/cuenta-rut', async (req, res) => {
    try {
        const clientes = await leerClientes();
        const clientesConCuentaRut = clientes.filter(cliente => cliente.cuentaRut !== null);

        res.render('index', {
            titulo: 'Clientes con Cuenta RUT',
            clientes: clientesConCuentaRut,
            filtro: 'cuenta-rut',
            mensaje: req.query.mensaje || '',
            error: req.query.error || ''
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).render('error', {
            titulo: 'Error del servidor',
            mensaje: 'No fue posible leer el archivo de clientes.'
        });
    }
});

app.post('/clientes/nuevo/cuenta-rut', async (req, res) => {
    try {
        const rut = normalizarRut(req.body.rut);
        const nombre = normalizarTexto(req.body.nombre);
        const numero = normalizarTexto(req.body.numeroCuenta);
        const saldo = convertirSaldo(req.body.saldo);

        if (!rut || !nombre || !numero || saldo === null) {
            return redirigirConMensaje(res, 'error', 'Debe completar correctamente todos los campos.');
        }

        const clientes = await leerClientes();

        if (buscarCliente(clientes, rut)) {
            return redirigirConMensaje(res, 'error', 'Ya existe un cliente registrado con ese RUT.');
        }

        if (numeroCuentaExiste(clientes, numero)) {
            return redirigirConMensaje(res, 'error', 'El número de cuenta ya está registrado.');
        }

        clientes.push({
            rut,
            nombre,
            cuentaRut: { numero, saldo },
            cuentasAhorro: []
        });

        await guardarClientes(clientes);
        return redirigirConMensaje(res, 'mensaje', 'Cliente y Cuenta RUT agregados correctamente.');
    }
    catch (error) {
        console.error(error);
        return redirigirConMensaje(res, 'error', 'No fue posible agregar el cliente.');
    }
});

app.post('/clientes/nuevo/cuenta-ahorro', async (req, res) => {
    try {
        const rut = normalizarRut(req.body.rut);
        const nombre = normalizarTexto(req.body.nombre);
        const numero = normalizarTexto(req.body.numeroCuenta);
        const saldo = convertirSaldo(req.body.saldo);

        if (!rut || !nombre || !numero || saldo === null) {
            return redirigirConMensaje(res, 'error', 'Debe completar correctamente todos los campos.');
        }

        const clientes = await leerClientes();

        if (buscarCliente(clientes, rut)) {
            return redirigirConMensaje(res, 'error', 'Ya existe un cliente registrado con ese RUT.');
        }

        if (numeroCuentaExiste(clientes, numero)) {
            return redirigirConMensaje(res, 'error', 'El número de cuenta ya está registrado.');
        }

        clientes.push({
            rut,
            nombre,
            cuentaRut: null,
            cuentasAhorro: [{ numero, saldo }]
        });

        await guardarClientes(clientes);
        return redirigirConMensaje(res, 'mensaje', 'Cliente y Cuenta de Ahorro agregados correctamente.');
    }
    catch (error) {
        console.error(error);
        return redirigirConMensaje(res, 'error', 'No fue posible agregar el cliente.');
    }
});

app.post('/clientes/:rut/cuenta-rut', async (req, res) => {
    try {
        const numero = normalizarTexto(req.body.numeroCuenta);
        const saldo = convertirSaldo(req.body.saldo);
        const clientes = await leerClientes();
        const cliente = buscarCliente(clientes, req.params.rut);

        if (!cliente) {
            return redirigirConMensaje(res, 'error', 'Cliente no encontrado.');
        }

        if (cliente.cuentaRut) {
            return redirigirConMensaje(res, 'error', 'El cliente ya tiene una Cuenta RUT.');
        }

        if (!numero || saldo === null) {
            return redirigirConMensaje(res, 'error', 'Debe ingresar un número de cuenta y un saldo válido.');
        }

        if (numeroCuentaExiste(clientes, numero)) {
            return redirigirConMensaje(res, 'error', 'El número de cuenta ya está registrado.');
        }

        cliente.cuentaRut = { numero, saldo };
        await guardarClientes(clientes);

        return redirigirConMensaje(res, 'mensaje', 'Cuenta RUT agregada correctamente.');
    }
    catch (error) {
        console.error(error);
        return redirigirConMensaje(res, 'error', 'No fue posible agregar la Cuenta RUT.');
    }
});

app.post('/clientes/:rut/cuentas-ahorro', async (req, res) => {
    try {
        const numero = normalizarTexto(req.body.numeroCuenta);
        const saldo = convertirSaldo(req.body.saldo);
        const clientes = await leerClientes();
        const cliente = buscarCliente(clientes, req.params.rut);

        if (!cliente) {
            return redirigirConMensaje(res, 'error', 'Cliente no encontrado.');
        }

        if (!numero || saldo === null) {
            return redirigirConMensaje(res, 'error', 'Debe ingresar un número de cuenta y un saldo válido.');
        }

        if (numeroCuentaExiste(clientes, numero)) {
            return redirigirConMensaje(res, 'error', 'El número de cuenta ya está registrado.');
        }

        cliente.cuentasAhorro.push({ numero, saldo });
        await guardarClientes(clientes);

        return redirigirConMensaje(res, 'mensaje', 'Cuenta de Ahorro agregada correctamente.');
    }
    catch (error) {
        console.error(error);
        return redirigirConMensaje(res, 'error', 'No fue posible agregar la Cuenta de Ahorro.');
    }
});

app.post('/clientes/:rut/eliminar', async (req, res) => {
    try {
        const clientes = await leerClientes();
        const cantidadInicial = clientes.length;
        const rut = normalizarRut(req.params.rut);

        const clientesActualizados = clientes.filter(cliente =>
            normalizarRut(cliente.rut) !== rut
        );

        if (clientesActualizados.length === cantidadInicial) {
            return redirigirConMensaje(res, 'error', 'Cliente no encontrado.');
        }

        await guardarClientes(clientesActualizados);
        return redirigirConMensaje(res, 'mensaje', 'Cliente y todas sus cuentas fueron eliminados.');
    }
    catch (error) {
        console.error(error);
        return redirigirConMensaje(res, 'error', 'No fue posible eliminar el cliente.');
    }
});

app.post('/clientes/:rut/cuenta-rut/eliminar', async (req, res) => {
    try {
        const clientes = await leerClientes();
        const cliente = buscarCliente(clientes, req.params.rut);

        if (!cliente) {
            return redirigirConMensaje(res, 'error', 'Cliente no encontrado.');
        }

        if (!cliente.cuentaRut) {
            return redirigirConMensaje(res, 'error', 'El cliente no tiene Cuenta RUT.');
        }

        if (cliente.cuentasAhorro.length === 0) {
            return redirigirConMensaje(
                res,
                'error',
                'No se puede eliminar la única cuenta del cliente. Elimine al cliente completo o agregue primero una Cuenta de Ahorro.'
            );
        }

        cliente.cuentaRut = null;
        await guardarClientes(clientes);

        return redirigirConMensaje(res, 'mensaje', 'Cuenta RUT eliminada correctamente.');
    }
    catch (error) {
        console.error(error);
        return redirigirConMensaje(res, 'error', 'No fue posible eliminar la Cuenta RUT.');
    }
});

app.post('/clientes/:rut/cuentas-ahorro/:numero/eliminar', async (req, res) => {
    try {
        const clientes = await leerClientes();
        const cliente = buscarCliente(clientes, req.params.rut);

        if (!cliente) {
            return redirigirConMensaje(res, 'error', 'Cliente no encontrado.');
        }

        const numero = normalizarTexto(req.params.numero).toLowerCase();
        const cantidadInicial = cliente.cuentasAhorro.length;

        const cuentasActualizadas = cliente.cuentasAhorro.filter(cuenta =>
            normalizarTexto(cuenta.numero).toLowerCase() !== numero
        );

        if (cuentasActualizadas.length === cantidadInicial) {
            return redirigirConMensaje(res, 'error', 'Cuenta de Ahorro no encontrada.');
        }

        if (!cliente.cuentaRut && cuentasActualizadas.length === 0) {
            return redirigirConMensaje(
                res,
                'error',
                'No se puede eliminar la única cuenta del cliente. Elimine al cliente completo o agregue primero una Cuenta RUT.'
            );
        }

        cliente.cuentasAhorro = cuentasActualizadas;
        await guardarClientes(clientes);

        return redirigirConMensaje(res, 'mensaje', 'Cuenta de Ahorro eliminada correctamente.');
    }
    catch (error) {
        console.error(error);
        return redirigirConMensaje(res, 'error', 'No fue posible eliminar la Cuenta de Ahorro.');
    }
});

app.use((req, res) => {
    res.status(404).render('error', {
        titulo: 'Ruta no encontrada',
        mensaje: 'La dirección solicitada no existe.'
    });
});

app.listen(puerto, () => {
    console.log(`Servidor ejecutándose en http://localhost:${puerto}`);
});
