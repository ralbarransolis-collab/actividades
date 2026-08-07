const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const PeliculasActores = sequelize.define(
    "PeliculasActores",
    {
        pelicula_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        actor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    },
    {
        tableName: "peliculas_actores",
        timestamps: false
    }
);

module.exports = PeliculasActores;
