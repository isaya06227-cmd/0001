const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importDatabase() {
    console.log('Starting database import...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        // Read the SQL file
        const sqlFilePath = path.join(__dirname, '../database.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log(`Reading SQL from: ${sqlFilePath}`);

        // Execute queries
        // Note: mysql2 with multipleStatements will execute all at once.
        await connection.query(sqlContent);
        
        console.log('SQL commands executed successfully.');
        console.log('Database A1_db created/updated and populated from database.sql');

        await connection.end();
    } catch (err) {
        console.error('Error during database import:', err);
        if (err.code === 'ECONNREFUSED') {
            console.error('Could not connect to MySQL. Please make sure MySQL is running (e.g., XAMPP is started).');
        }
    }
}

importDatabase();
