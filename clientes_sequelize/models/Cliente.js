const { DataTypes } = require("sequelize");

const sequelize = require("../data/db");

const Cliente = sequelize.define(
    "Cliente",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: "id_cliente"
        },

        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "nombre_cliente"
        },

        email: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
            field: "correo"
        }
    },
    {
        tableName: "clientes_difer",
        timestamps: false
    }
);

module.exports = Cliente;
