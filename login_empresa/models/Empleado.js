const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Empleado = sequelize.define(
    'Empleado',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        cargo: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        sueldo: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_asistencias: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: 'empleados',
        timestamps: false
    }
);

module.exports = Empleado;