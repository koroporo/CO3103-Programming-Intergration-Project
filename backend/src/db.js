const { Pool } = require("pg");
require("dotenv").config();

const requiredEnvironmentVariables = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD"
];
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
    (name) => !process.env[name]
);

if (missingEnvironmentVariables.length > 0) {
    throw new Error(
        `Missing required database environment variables: ${missingEnvironmentVariables.join(", ")}`
    );
}

const port = Number(process.env.DB_PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DB_PORT must be an integer between 1 and 65535");
}

const pool = new Pool({
    host: process.env.DB_HOST,
    port,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

module.exports = pool;