const { Pool } = require("pg");
require("dotenv").config();

console.log({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

pool.query("SELECT current_database(), current_user, inet_server_port()")
    .then(result => console.log(result.rows))
    .catch(error => console.error(error));

module.exports = pool;