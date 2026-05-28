const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'A1_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected to database.');

        // Check if column exists
        const [rows] = await connection.query("SHOW COLUMNS FROM employee LIKE 'profile_image'");

        if (rows.length === 0) {
            console.log('Adding profile_image column to employee table...');
            await connection.query("ALTER TABLE employee ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL");
            console.log('Column added successfully.');
        } else {
            console.log('Column profile_image already exists.');
        }

        await connection.end();
    } catch (err) {
        console.error('Error updating schema:', err);
    }
}

updateSchema();
