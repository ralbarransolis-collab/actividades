require('dotenv').config();

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');
const Empleado = require('./models/Empleado');
const Asistencia = require('./models/Asistencia');

Empleado.hasMany(Asistencia, {
    foreignKey: 'empleado_id',
    as: 'asistencia'
});

Asistencia.belongsTo(Empleado, {
    foreignKey: 'empleado_id',
    as: 'empleado'
});

const app = express();
const PORT = process.env.PORT || 3000;


// ========================================
// CONFIGURACIÓN DE EJS
// ========================================

app.set('view engine', 'ejs');
app.set('views', './views');


// ========================================
// MIDDLEWARES
// ========================================


//permite enviar datos por json al servidor
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static('public'));

//permite recibir datos por json en el servidor
app.use(express.json());


// ========================================
// CONFIGURACIÓN DE LA SESIÓN
// ========================================

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
        maxAge: 1000 * 60 * 30,
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    }
}));


// ========================================
// USUARIO DISPONIBLE EN TODAS LAS VISTAS
// ========================================

app.use((req, res, next) => {
    res.locals.usuarioLogueado =
        req.session.usuario || null;

    next();
});


// ========================================
// VERIFICAR SESIÓN
// ========================================

function verificarSesion(req, res, next) {
    if (!req.session.usuario) {
        return res.redirect(
            '/login?mensaje=' +
            encodeURIComponent(
                'Debe iniciar sesión para continuar'
            )
        );
    }

    next();
}


// ========================================
// RUTA INICIAL
// ========================================

app.get('/', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/bienvenida');
    }

    res.redirect('/login');
});


// ========================================
// MOSTRAR LOGIN
// ========================================

app.get('/login', (req, res) => {
    if (req.session.usuario) {
        return res.redirect('/bienvenida');
    }

    res.render('login', {
        mensaje: req.query.mensaje || null
    });
});


// ========================================
// PROCESAR LOGIN
// ========================================

app.post('/login', async (req, res) => {
    try {
        const {
            correo = '',
            password = ''
        } = req.body;

        const correoLimpio =
            correo.trim().toLowerCase();

        const usuario = await Usuario.findOne({
            where: {
                correo: correoLimpio
            }
        });

        if (!usuario) {
            return res.status(401).render('login', {
                mensaje: 'Correo o contraseña inválidos'
            });
        }

        const passwordCorrecta =
            await bcrypt.compare(
                password,
                usuario.password
            );

        if (!passwordCorrecta) {
            return res.status(401).render('login', {
                mensaje: 'Correo o contraseña inválidos'
            });
        }

        // Guardamos únicamente datos necesarios.
        // Nunca guardamos la contraseña en la sesión.
        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo
        };

        await new Promise((resolve, reject) => {
            req.session.save((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

        return res.redirect('/bienvenida');
    }
    catch (error) {
        console.log(
            'Error al iniciar sesión:',
            error.message
        );

        return res.status(500).render('login', {
            mensaje: 'Ocurrió un error en el servidor'
        });
    }
});


// ========================================
// PÁGINA DE BIENVENIDA
// ========================================

app.get('/bienvenida', verificarSesion, (req, res) => {
    res.render('bienvenida', {
        mensaje:
            `Bienvenido, ${req.session.usuario.nombre}`
    });
});


// ========================================
// CERRAR SESIÓN
// ========================================

app.post('/logout', verificarSesion, (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.log(
                'Error al cerrar sesión:',
                error.message
            );

            return res.status(500).send(
                'No se pudo cerrar la sesión'
            );
        }

        res.clearCookie('connect.sid');

        return res.redirect(
            '/login?mensaje=' +
            encodeURIComponent(
                'Sesión cerrada correctamente'
            )
        );
    });
});


// ========================================
// MOSTRAR USUARIOS
// ========================================

app.get('/usuarios', verificarSesion, async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: [
                'id',
                'nombre',
                'correo'
            ],

            order: [
                ['id', 'ASC']
            ]
        });

        res.render('usuarios', {
            usuarios,
            error: req.query.error || null,
            mensaje: req.query.mensaje || null
        });
    }
    catch (error) {
        console.log(
            'Ocurrió un error consultando los datos:',
            error.message
        );

        res.status(500).send(
            'Ocurrió un error consultando los datos'
        );
    }
});


// ========================================
// CREAR USUARIO
// ========================================

app.post('/usuarios', verificarSesion, async (req, res) => {
    try {
        const {
            nombre = '',
            correo = '',
            password = ''
        } = req.body;

        const nombreLimpio = nombre.trim();

        const correoLimpio =
            correo.trim().toLowerCase();

        const passwordLimpia = password.trim();

        if (
            !nombreLimpio ||
            !correoLimpio ||
            !passwordLimpia
        ) {
            return res.redirect(
                '/usuarios?error=' +
                encodeURIComponent(
                    'Todos los campos son obligatorios'
                )
            );
        }

        const formatoCorreo =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoCorreo.test(correoLimpio)) {
            return res.redirect(
                '/usuarios?error=' +
                encodeURIComponent(
                    'Debe ingresar un correo válido'
                )
            );
        }

        if (passwordLimpia.length < 6) {
            return res.redirect(
                '/usuarios?error=' +
                encodeURIComponent(
                    'La contraseña debe tener al menos 6 caracteres'
                )
            );
        }

        const usuarioExistente =
            await Usuario.findOne({
                where: {
                    correo: correoLimpio
                }
            });

        if (usuarioExistente) {
            return res.redirect(
                '/usuarios?error=' +
                encodeURIComponent(
                    'El correo ya está registrado'
                )
            );
        }

        const passwordCifrada =
            await bcrypt.hash(
                passwordLimpia,
                10
            );

        await Usuario.create({
            nombre: nombreLimpio,
            correo: correoLimpio,
            password: passwordCifrada
        });

        return res.redirect(
            '/usuarios?mensaje=' +
            encodeURIComponent(
                'Usuario creado correctamente'
            )
        );
    }
    catch (error) {
        console.log(
            'Error al crear el usuario:',
            error.message
        );

        return res.redirect(
            '/usuarios?error=' +
            encodeURIComponent(
                'Ocurrió un error al crear el usuario'
            )
        );
    }
});


// ========================================
// MOSTRAR FORMULARIO DE EDICIÓN
// ========================================

app.get(
    '/usuarios/editar/:id',
    verificarSesion,
    async (req, res) => {
        try {
            const id = req.params.id;

            const usuario =
                await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).send(
                    'Usuario no encontrado'
                );
            }

            res.render('editar-usuario', {
                usuario,
                error: null
            });
        }
        catch (error) {
            console.log(
                'Error al obtener el usuario:',
                error.message
            );

            res.status(500).send(
                'Ocurrió un error consultando el usuario'
            );
        }
    }
);


// ========================================
// ACTUALIZAR USUARIO
// ========================================

app.post(
    '/usuarios/editar/:id',
    verificarSesion,
    async (req, res) => {
        try {
            const id = req.params.id;

            const {
                nombre = '',
                correo = '',
                password = ''
            } = req.body;

            const nombreLimpio = nombre.trim();

            const correoLimpio =
                correo.trim().toLowerCase();

            const passwordLimpia =
                password.trim();

            const usuario =
                await Usuario.findByPk(id);

            if (!usuario) {
                return res.status(404).send(
                    'Usuario no encontrado'
                );
            }

            if (!nombreLimpio || !correoLimpio) {
                return res.render(
                    'editar-usuario',
                    {
                        usuario,
                        error:
                            'El nombre y el correo son obligatorios'
                    }
                );
            }

            const formatoCorreo =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!formatoCorreo.test(correoLimpio)) {
                return res.render(
                    'editar-usuario',
                    {
                        usuario,
                        error:
                            'Debe ingresar un correo válido'
                    }
                );
            }

            const correoExistente =
                await Usuario.findOne({
                    where: {
                        correo: correoLimpio,

                        id: {
                            [Op.ne]: id
                        }
                    }
                });

            if (correoExistente) {
                return res.render(
                    'editar-usuario',
                    {
                        usuario,
                        error:
                            'El correo ya está registrado por otro usuario'
                    }
                );
            }

            usuario.nombre = nombreLimpio;
            usuario.correo = correoLimpio;

            if (passwordLimpia !== '') {
                if (passwordLimpia.length < 6) {
                    return res.render(
                        'editar-usuario',
                        {
                            usuario,
                            error:
                                'La nueva contraseña debe tener al menos 6 caracteres'
                        }
                    );
                }

                usuario.password =
                    await bcrypt.hash(
                        passwordLimpia,
                        10
                    );
            }

            await usuario.save();

            /*
            Si el usuario editado es quien tiene
            la sesión iniciada, actualizamos también
            los datos guardados en su sesión.
            */
            if (
                req.session.usuario.id ===
                usuario.id
            ) {
                req.session.usuario.nombre =
                    usuario.nombre;

                req.session.usuario.correo =
                    usuario.correo;
            }

            return res.redirect(
                '/usuarios?mensaje=' +
                encodeURIComponent(
                    'Usuario actualizado correctamente'
                )
            );
        }
        catch (error) {
            console.log(
                'Error al actualizar el usuario:',
                error.message
            );

            res.status(500).send(
                'Ocurrió un error al actualizar el usuario'
            );
        }
    }
);


// ========================================
// ELIMINAR USUARIO
// ========================================

app.post(
    '/usuarios/eliminar/:id',
    verificarSesion,
    async (req, res) => {
        try {
            const id = req.params.id;

            const usuario =
                await Usuario.findByPk(id);

            if (!usuario) {
                return res.redirect(
                    '/usuarios?error=' +
                    encodeURIComponent(
                        'Usuario no encontrado'
                    )
                );
            }

            await usuario.destroy();

            return res.redirect(
                '/usuarios?mensaje=' +
                encodeURIComponent(
                    'Usuario eliminado correctamente'
                )
            );
        }
        catch (error) {
            console.log(
                'Error al eliminar el usuario:',
                error.message
            );

            res.status(500).send(
                'Ocurrió un error al eliminar el usuario'
            );
        }
    }
);


app.get('/asistencias', verificarSesion, async (req, res) => {
    try {
        const asistencias = await Asistencia.findAll({
            include: {
                model: Empleado,
                as: 'empleado',
                attributes: [
                    'nombre',
                    'cargo',
                    'sueldo'
                ]
            },
            order: [
                ['fecha', 'DESC']
            ]
        });

        res.render('asistencias', {
            asistencias
        });
    } catch (error) {
        console.error(error);

        res.status(500).send(
            'Ocurrió un error al consultar las asistencias'
        );
    }
});

app.get('/resumen-empleados', verificarSesion, async (req, res) => {
    try {
        const empleados = await Empleado.findAll({
            include: {
                model: Asistencia,
                as: 'asistencia',
                attributes: ['presente']
            },
            order: [
                ['id', 'ASC']
            ]
        });

        res.render('resumen-empleados', {
            empleados
        });
    } catch (error) {
        console.error('Error al consultar empleados:', error.message);
        console.error('Error de PostgreSQL:', error.original?.message);

        res.status(500).send(
            'Ocurrió un error al consultar los empleados'
        );
    }
});

app.get('/api/v1/empleados', async (req, res) => {
    try {
        const empleados = await Empleado.findAll({
            order: [
                ['id', 'ASC']
            ]
        });

        res.status(200).json({
            cantidad: empleados.length,
            datos: empleados
        });
    }
    catch (error) {
        console.log("Error: " + error);
        res.status(500).json({
            mensaje: "Error interno"

        });

    }
});



app.get('/api/v1/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            order: [
                ['id', 'ASC']
            ]
        });

        res.status(200).json({
            cantidad: usuarios.length,
            datos: usuarios
        });
    }
    catch (error) {
        console.log("Error: " + error);
        res.status(500).json({
            mensaje: "Error interno"

        });

    }
});

app.get('/api/v1/asistencias', async (req, res) => {
    try {
        const asistencias = await Asistencia.findAll({

            include: {
                model: Empleado,
                as: 'empleado',
                attributes: [
                    'id',
                    'nombre',
                    'cargo',
                    'sueldo'
                ],
                required: true
            },

            order: [
                ['id', 'ASC']
            ]
        });

        res.status(200).json({
            cantidad: asistencias.length,
            datos: asistencias
        });
    }
    catch (error) {
        console.log("Error: " + error);
        res.status(500).json({
            mensaje: "Error interno"

        });

    }
});


app.get('/api/v1/empleados/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findByPk(id);

        if (!empleado) {
            return res.status(404).json({
                mensaje: 'No se encontró el empleado'
            });
        }

        return res.status(200).json({
            datos: empleado
        });
    }
    catch (error) {
        console.log(
            'Error al consultar el empleado:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error interno'
        });
    }
});

app.get('/api/v1/asistencias/ausencias', async (req, res) => {
    try {
        const asistencias = await Asistencia.findAll({
            where: { 
                presente: false
            },

            include: {  
                model: Empleado,
                as: 'empleado',
                attributes: [
                    'id',
                    'nombre',
                
                ],
                required: true
            },

            order: [
                ['id', 'ASC']
            ]
        });

        res.status(200).json({
            cantidad: asistencias.length,
            datos: asistencias
        });
    }
    catch (error) {
        console.log("Error: " + error);
        res.status(500).json({
            mensaje: "Error interno"

        });

    }
});

app.get('/api/v1/asistencias/rango', async (req, res) => {
    try {
        const { desde, hasta } = req.query;

        if (!desde || !hasta) {
            return res.status(400).json({
                mensaje: 'Debe indicar las fechas desde y hasta'
            });
        }

        const asistencias = await Asistencia.findAll({
            where: {
                fecha: {
                    [Op.between]: [desde, hasta]
                }
            },

            include: {
                model: Empleado,
                as: 'empleado',
                attributes: [
                    'id',
                    'nombre',
                    'cargo'
                ],
                required: true
            },

                order: [
                    ['empleado_id', 'ASC']
                ]
        });

        return res.status(200).json({
            cantidad: asistencias.length,
            datos: asistencias
        });
    }
    catch (error) {
        console.log(
            'Error al consultar el rango:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error interno'
        });
    }
});

app.get('/api/v1/asistencias/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const asistencia = await Asistencia.findByPk(id, {
            include: {
                model: Empleado,
                as: 'empleado',
                attributes: [
                    'id',
                    'nombre',
                    'cargo',
                    'sueldo'
                ]
            }
        });

        if (!asistencia) {
            return res.status(404).json({
                mensaje: 'No se encontró la asistencia'
            });
        }

        return res.status(200).json({
            datos: asistencia
        });
    }
    catch (error) {
        console.log(
            'Error al consultar la asistencia:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error interno'
        });
    }
});

app.get('/api/v1/usuarios/correo/:correo', async (req, res) => {
    try {
        const correo = req.params.correo
            .trim()
            .toLowerCase();

        const usuario = await Usuario.findOne({
            where: {
                correo: correo
            },
            attributes: [
                'id',
                'nombre',
                'correo',
                'activo'
            ]
        });

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'No se encontró el usuario'
            });
        }

        return res.status(200).json({
            datos: usuario
        });
    }
    catch (error) {
        console.log(
            'Error al consultar el usuario:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error interno'
        });
    }
});

app.post('/api/v1/empleados', async (req, res) => {
    try {
        const {
            nombre,
            cargo,
            sueldo,
            total_asistencias
        } = req.body;

        if (!nombre || !cargo || sueldo === undefined) {
            return res.status(400).json({
                mensaje: 'Nombre, cargo y sueldo son obligatorios'
            });
        }

        const empleado = await Empleado.create({
            nombre,
            cargo,
            sueldo,
            total_asistencias: total_asistencias || 0
        });

        res.status(201).json({
            mensaje: 'Empleado creado correctamente',
            datos: empleado
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: 'Error interno al crear el empleado'
        });
    }
});

app.post('/api/v1/usuarios', async (req, res) => {
    try {
        const {
            nombre = '',
            correo = '',
            password = ''
        } = req.body;

        const nombreLimpio = nombre.trim();
        const correoLimpio = correo.trim().toLowerCase();
        const passwordLimpia = password.trim();

        if (!nombreLimpio || !correoLimpio || !passwordLimpia) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        if (passwordLimpia.length < 6) {
            return res.status(400).json({
                mensaje: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const usuarioExistente = await Usuario.findOne({
            where: {
                correo: correoLimpio
            }
        });

        if (usuarioExistente) {
            return res.status(409).json({
                mensaje: 'El correo ya está registrado'
            });
        }

        const passwordCifrada = await bcrypt.hash(
            passwordLimpia,
            10
        );

        const usuario = await Usuario.create({
            nombre: nombreLimpio,
            correo: correoLimpio,
            password: passwordCifrada
        });

        return res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            datos: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                activo: usuario.activo
            }
        });
    }
    catch (error) {
        console.error(
            'Error al crear el usuario:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error interno al crear el usuario'
        });
    }
});

app.post('/api/v1/asistencias', async (req, res) => {
    try {
        const {
            empleado_id,
            fecha,
            presente
        } = req.body;

        if (empleado_id === undefined || !fecha || presente === undefined ) {
            return res.status(400).json({
                mensaje: 'empleado_id, fecha y presente son obligatorios'
            });
        }

        const empleado = await Empleado.findByPk(empleado_id);

        if (!empleado) {
            return res.status(404).json({
                mensaje: 'No se encontró el empleado'
            });
        }

        const asistencia = await Asistencia.create({
            empleado_id,
            fecha,
            presente
        });

        return res.status(201).json({
            mensaje: 'Asistencia creada correctamente',
            datos: {
                id: asistencia.id,
                empleado_id: asistencia.empleado_id,
                empleado: empleado.nombre,
                fecha: asistencia.fecha,
                presente: asistencia.presente
            }
        });
    }
    catch (error) {
        console.log(
            'Error al crear la asistencia:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error interno al crear la asistencia'
        });
    }
});

app.post('/api/v1/asistencias/sin-duplicar', async (req, res) => {
    try {
        const {
            empleado_id,
            fecha,
            presente
        } = req.body;

        if (
            empleado_id === undefined ||
            !fecha ||
            presente === undefined
        ) {
            return res.status(400).json({
                mensaje: 'empleado_id, fecha y presente son obligatorios'
            });
        }

        if (typeof presente !== 'boolean') {
            return res.status(400).json({
                mensaje: 'El campo presente debe ser true o false'
            });
        }

        const empleado = await Empleado.findByPk(empleado_id);

        if (!empleado) {
            return res.status(404).json({
                mensaje: 'No se encontró el empleado'
            });
        }

        const asistenciaExistente = await Asistencia.findOne({
            where: {
                empleado_id: empleado_id,
                fecha: fecha
            }
        });

        if (asistenciaExistente) {
            return res.status(409).json({
                mensaje:
                    'El empleado ya tiene una asistencia registrada en esa fecha'
            });
        }

        const asistencia = await Asistencia.create({
            empleado_id,
            fecha,
            presente
        });

        return res.status(201).json({
            mensaje: 'Asistencia creada correctamente',
            datos: {
                id: asistencia.id,
                empleado_id: asistencia.empleado_id,
                empleado: empleado.nombre,
                fecha: asistencia.fecha,
                presente: asistencia.presente
            }
        });
    }
    catch (error) {
        console.log(
            'Error al crear la asistencia:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error interno al crear la asistencia'
        });
    }
});

// ========================================
// INICIAR SERVIDOR
// ========================================

async function iniciarServidor() {
    try {
        await sequelize.authenticate();

        console.log(
            'Conexión con la Base de Datos establecida'
        );

        app.listen(PORT, () => {
            console.log(
                `Servidor ejecutándose en http://localhost:${PORT}`
            );
        });
    }
    catch (error) {
        console.log(
            'Hubo un error en el proceso:',
            error.message
        );
    }
}

iniciarServidor();