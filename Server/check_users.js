const db = require('./db');

async function checkUsers() {
    try {
        const [rows] = await db.query('SELECT user_id, username, team FROM user_login_work');
        console.log('Users in database:');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('Error fetching users:', err);
        process.exit(1);
    }
}

checkUsers();
