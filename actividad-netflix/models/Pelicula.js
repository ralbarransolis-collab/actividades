class Pelicula {
    constructor(nombre, director, anio) {
        this.nombre = String(nombre).trim();
        this.director = String(director).trim();
        this.anio = Number(anio);
    }

    convertirALinea() {
        return `${this.nombre}, ${this.director}, ${this.anio}`;
    }

    static crearDesdeLinea(linea) {
        const campos = linea
            .split(',')
            .map(campo => campo.trim());

        return new Pelicula(
            campos[0],
            campos[1],
            campos[2]
        );
    }
}

module.exports = Pelicula;
