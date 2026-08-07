const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Pelicula = sequelize.define(
    "Pelicula",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        titulo: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        anio: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1888,
                max: 2100
            }
        }
    },
    {
        tableName: "peliculas",
        timestamps: false
    }
);

module.exports = Pelicula;
