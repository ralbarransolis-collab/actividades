const chalk = require("chalk");
const dayjs = require("dayjs");

const fechaActual = dayjs().format("DD-MM-YYYY HH:mm:ss");

console.log(`Fecha y hora actual: ${fechaActual}`);

console.log(
    chalk.green("Bienvenido a la aplicación de paquetes externos de NPM")
);

console.log(
    chalk.yellow(`La fecha y hora actual es: ${fechaActual}`)
);