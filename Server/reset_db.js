const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetDatabase() {
    console.log('Resetting database with new schema...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected to MySQL.');

        // 1. Drop and Recreate Database to ensure fresh start with new PK types
        await connection.query('DROP DATABASE IF EXISTS A1_db');
        await connection.query('CREATE DATABASE A1_db');
        await connection.query('USE A1_db');

        // 2. Read and Execute database.sql
        const sqlFilePath = path.join(__dirname, '../database.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        await connection.query(sqlContent);
        console.log('Schema applied successfully.');

        // 3. Re-create Admin with new employee_id format
        const adminEmpId = 'EMP000001';
        await connection.execute(
            'INSERT INTO employee (employee_id, full_name, department, position) VALUES (?, ?, ?, ?)',
            [adminEmpId, 'System Admin', 'Management', 'Administrator']
        );

        const hashedPassword = await bcrypt.hash('admin', 10);
        await connection.execute(
            'INSERT INTO user_login_work (user_id, username, password, employee_id, team) VALUES (?, ?, ?, ?, ?)',
            [999, 'admin', hashedPassword, adminEmpId, 'admin']
        );
        console.log('Admin user recreated (EMP000001).');

        await connection.end();
        console.log('Database reset complete.');
    } catch (err) {
        console.error('Error resetting database:', err);
    }
}

resetDatabase();
