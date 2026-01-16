const db = require('./db');

async function testWorkStatus() {
    try {
        console.log('=== Testing Work Status Update ===');

        // 1. ดูงานทั้งหมดในตาราง works
        const [allWorks] = await db.query('SELECT work_id, works_name, status FROM works LIMIT 10');
        console.log('\n📊 งานทั้งหมดในตาราง works:');
        console.table(allWorks);

        // 2. ดูการส่งงานที่ผ่านแล้ว
        const [passedSubmissions] = await db.query(`
      SELECT submitted_id, works_id, status, reviewer_comment 
      FROM submitted_works 
      WHERE status = 'ผ่าน' 
      LIMIT 10
    `);
        console.log('\n✅ งานที่ส่งและผ่านแล้ว:');
        console.table(passedSubmissions);

        // 3. ดูงานที่ถูก export แล้ว
        const [exportedWorks] = await db.query('SELECT works_id, username FROM exported_works LIMIT 10');
        console.log('\n📦 งานที่ถูก export:');
        console.table(exportedWorks);

        // 4. ทดสอบ query จาก API /api/my-works
        const testUsername = 'admin'; // เปลี่ยนตามที่ใช้จริง
        const [myWorks] = await db.query(`
      SELECT 
        w.work_id,
        w.works_name,
        w.status,
        w.project_id,
        p.project_name
      FROM works w
      JOIN projects p ON w.project_id = p.project_id
      WHERE w.assigned_to = ?
      ORDER BY w.due_date ASC
    `, [testUsername]);
        console.log(`\n👤 งานของ ${testUsername}:`);
        console.table(myWorks);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testWorkStatus();
