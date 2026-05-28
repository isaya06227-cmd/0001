const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'A1_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected to database.');

        // 1. Create Employee (or use existing if we could find one, but let's just make one for Admin)
        const [empResult] = await connection.execute(
            'INSERT INTO employee (full_name, department, position) VALUES (?, ?, ?)',
            ['System Admin', 'Management', 'Administrator']
        );
        const employeeId = empResult.insertId;
        console.log(`Created employee entry with ID: ${employeeId}`);

        // 2. Hash Password
        const password = 'admin';
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User
        // We'll give Admin a fixed ID like 999 for easy identification
        const userId = 999;

        // Remove existing admin if exists to ensure clean slate (optional, but good for "fixing" things)
        // But since username is Primary Key, we can just INSERT IGNORE or handle error.
        // Let's try to delete old admin first just in case to reset password.
        await connection.execute('DELETE FROM user_login_work WHERE username = ?', ['admin']);

        await connection.execute(
            'INSERT INTO user_login_work (user_id, username, password, employee_id, team) VALUES (?, ?, ?, ?, ?)',
            [userId, 'admin', hashedPassword, employeeId, 'admin']
        );

        console.log('-------------------------------------------');
        console.log('✅ Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin');
        console.log('-------------------------------------------');

        await connection.end();
    } catch (err) {
        console.error('Error creating admin user:', err);
    }
}

createAdmin();
