const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');

async function crearUsuario() {
    try {
        await sequelize.authenticate();

        const usuarioExistente = await Usuario.findOne({
                where: {
                    correo: 'admin@empresa.cl'
                }
            }
        );

        if (usuarioExistente) {
            console.log('El usuario ya existe');

            return;
        }

        const passwordCifrada = await bcrypt.hash('123', 10);

        await Usuario.create({
            nombre: 'Administrador',
            correo: 'admin@empresa.cl',
            password: passwordCifrada
        });

        console.log('Usuario creado');
    }
    catch(error){
        console.log('Error al intentar crear el usuario: ', error.message);
    }
    finally{
        await sequelize.close();
    }
}

crearUsuario();