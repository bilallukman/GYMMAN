const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

// Load backend/.env
dotenv.config({
    path: path.resolve(__dirname, "../.env")
});

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test MySQL connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();

        console.log("MySQL database connected successfully.");

        connection.release();

    } catch (error) {

        console.error(
            "MySQL connection failed:",
            error.message
        );

        throw error;
    }
}

testConnection();

module.exports = pool;