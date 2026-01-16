const db = require('./db');

async function fixSchema() {
    try {
        console.log('Attempting to drop Foreign Key fk_responsible_team...');
        // Note: In MySQL, sometimes we need to drop the constraint name.
        await db.query('ALTER TABLE projects DROP FOREIGN KEY fk_responsible_team');
        console.log('Foreign Key fk_responsible_team dropped successfully.');
    } catch (err) {
        console.error('Error dropping FK (it might not exist):', err.message);
    }

    try {
        // Also try to drop index if it exists with the same name, as MySQL often creates one
        await db.query('DROP INDEX fk_responsible_team ON projects');
        console.log('Index fk_responsible_team dropped successfully.');
    } catch (err) {
        // Ignore if index not found
        console.log('Index drop skipped or failed:', err.message);
    }

    try {
        console.log('Modifying responsible_team column to VARCHAR(255)...');
        await db.query('ALTER TABLE projects MODIFY COLUMN responsible_team VARCHAR(255) NULL');
        console.log('Column modified successfully to support multiple teams.');
    } catch (err) {
        console.error('Error modifying column:', err.message);
    }

    process.exit();
}

fixSchema();
