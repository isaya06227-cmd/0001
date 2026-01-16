// This endpoint approves work directly, skipping reviewed_works table
app.post('/api/approve-work-direct', async (req, res) => {
    const { submitted_id, username, project_id, works_id, round_number, link, reviewer_comment } = req.body;

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insert into exported_works (Archiving)
        await conn.query(`
      INSERT INTO exported_works 
      (submitted_id, username, project_id, works_id, round_number, link, reviewer_comment, review_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
            [submitted_id, username, project_id, works_id, round_number, link, reviewer_comment]
        );

        // 2. Check statuses of all submitted_works for this work_id to update parent work status
        // Note: The current submission should already be 'ผ่าน' status in submitted_works if it appears in ReviewWorks.
        const [rows] = await conn.query(
            `SELECT status FROM submitted_works WHERE works_id = ?`,
            [works_id]
        );

        // Determine parent work status
        let worksStatus = 'เสร็จสิ้น';
        for (const row of rows) {
            // If any submission is 'ไม่ผ่าน' or 'รอดำเนินการ', work is not fully done?
            // Or maybe we treat 'ผ่าน' submissions as progress?
            // The logic in exported_works endpoint was similar.
            if (row.status === 'ไม่ผ่าน' || row.status === 'รอดําเนินการ') {
                worksStatus = 'กำลังดำเนินการ';
                break;
            }
        }

        // 3. Update parent work status
        await conn.query(
            `UPDATE works 
       SET status = ? 
       WHERE work_id = ? AND project_id = ?`,
            [worksStatus, works_id, project_id]
        );

        await conn.commit();
        res.json({ message: 'อนุมัติงานและบันทึกเรียบร้อย' });

    } catch (err) {
        await conn.rollback();
        console.error('Approve Work Direct Error:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอนุมัติงาน' });
    } finally {
        conn.release();
    }
});
