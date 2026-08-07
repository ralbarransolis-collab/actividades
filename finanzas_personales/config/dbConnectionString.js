const { Pool } = require("pg");

const poolConnectionString = new Pool({
    connectionString: process.env.DATABASE_URL
});

poolConnectionString.on("error", (error) => {
    console.error(
        "Error inesperado en el pool connectionString:",
        error.message
    );
});

module.exports = poolConnectionString;