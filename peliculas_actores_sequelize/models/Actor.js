const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Actor = sequelize.define(
    "Actor",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(120),
            allowNull: false
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false
        }
    },
    {
        tableName: "actores",
        timestamps: false
    }
);

module.exports = Actor;
