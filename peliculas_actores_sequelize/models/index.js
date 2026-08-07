const Pelicula = require("./Pelicula");
const Actor = require("./Actor");
const PeliculasActores = require("./PeliculasActores");

Pelicula.belongsToMany(
    Actor,
    {
        through: PeliculasActores,
        foreignKey: "pelicula_id",
        otherKey: "actor_id"
    }
);

Actor.belongsToMany(
    Pelicula,
    {
        through: PeliculasActores,
        foreignKey: "actor_id",
        otherKey: "pelicula_id"
    }
);

module.exports = {
    Pelicula,
    Actor,
    PeliculasActores
};
