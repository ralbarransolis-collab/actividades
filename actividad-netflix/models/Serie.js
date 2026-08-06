class Serie {
    constructor(nombre, anio, temporadas) {
        this.nombre = String(nombre).trim();
        this.anio = Number(anio);
        this.temporadas = Number(temporadas);
    }

    convertirALinea() {
        return `${this.nombre}, ${this.anio}, ${this.temporadas}`;
    }

    static crearDesdeLinea(linea) {
        const campos = linea
            .split(',')
            .map(campo => campo.trim());

        return new Serie(
            campos[0],
            campos[1],
            campos[2]
        );
    }
}

module.exports = Serie;
