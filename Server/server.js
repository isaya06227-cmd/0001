const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('./db');
const app = express();
const PORT = 3001;
const pool = require('./db');
app.use(cors());
app.use(bodyParser.json());
const cloudinary = require('./cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'employee_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const upload = multer({ storage: storage });

const STATIC_PATH = path.resolve(__dirname, "public");
app.use(express.static(STATIC_PATH));

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    'https://v2taskk.onrender.com', // domain จริงของ frontend
    'https://www.v2taskk.onrender.com' // เพิ่มถ้ามี www
  ]
  : ['http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ];        // local dev

(process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
  .forEach(origin => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });

app.use(cors({
  origin: function (origin, callback) {
    // ถ้า origin ไม่มี (เช่น Postman หรือ same-origin) ให้อนุญาต
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // อนุญาต cookie
}));

// สมัครสมาชิก
app.post('/api/register', async (req, res) => {
  const { username, password, employee_id, team } = req.body; // 

  if (!username || !password || !employee_id || !team) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  try {
    // ตรวจสอบ username ซ้ำ
    const [rows] = await db.query(
      'SELECT * FROM user_login_work WHERE username = ?',
      [username]
    );
    if (rows.length > 0) {
      return res.status(409).json({ message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
    }

    // ฟังก์ชันสุ่ม user_id 3 หลักและตรวจสอบไม่ซ้ำ
    async function generateUniqueUserId() {
      while (true) {
        const randomId = Math.floor(100 + Math.random() * 900); // สุ่มเลข 100-999
        const [result] = await db.query(
          'SELECT * FROM user_login_work WHERE user_id = ?',
          [randomId]
        );
        if (result.length === 0) {
          return randomId;
        }
      }
    }

    const userId = await generateUniqueUserId();

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);


    await db.query(
      'INSERT INTO user_login_work (user_id, username, password, employee_id, team) VALUES (?, ?, ?, ?, ?)',
      [userId, username, hashedPassword, employee_id, team]
    );

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user_id: userId });
  } catch (err) {
    console.error('❌ สมัครสมาชิกล้มเหลว:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});



// ล็อกอิน
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM user_login_work WHERE username = ?', [username])

    if (rows.length === 0) {
      return res.status(401).json({ message: 'ไม่พบผู้ใช้งานนี้' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    const team = (user.team || '').trim().toLowerCase(); // รับค่า team จาก DB ตัดช่องว่าง+toLowerCase

    res.json({
      message: 'ล็อกอินสำเร็จ',
      user_id: user.user_id,
      username: user.username,
      employee_id: user.employee_id,
      team: team
    });

  } catch (err) {
    console.error('❌ ล็อกอินล้มเหลว:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

// ลบผู้ใช้ (User Login Work)
app.delete('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [result] = await db.query('DELETE FROM user_login_work WHERE username = ?', [username]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการลบ' });
    }

    res.json({ message: 'ลบผู้ใช้เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('ลบผู้ใช้ล้มเหลว:', err);
    res.status(500).json({ error: 'ลบผู้ใช้ล้มเหลว (อาจมีข้อมูลเชื่อมโยงอยู่)' });
  }
});

// แก้ไขข้อมูลผู้ใช้ (Update User)
app.put('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  const { team, password, new_username, employee_id } = req.body;

  try {
    // 1. ถ้ามีการเปลี่ยน Username ต้องเช็คว่าซ้ำไหม
    if (new_username && new_username !== username) {
      const [existing] = await db.query('SELECT 1 FROM user_login_work WHERE username = ?', [new_username]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
      }
    }

    let query = 'UPDATE user_login_work SET team = ?';
    let params = [team];

    if (employee_id) {
      query += ', employee_id = ?';
      params.push(employee_id);
    }

    if (new_username && new_username !== username) {
      query += ', username = ?';
      params.push(new_username);
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE username = ?';
    params.push(username);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' });
    }

    res.json({ message: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว' });
  } catch (err) {
    console.error('แก้ไขผู้ใช้ล้มเหลว:', err);
    res.status(500).json({ error: 'แก้ไขผู้ใช้ล้มเหลว' });
  }
});


// route: /api/projects/team/:team
app.get('/api/projects/team/:team', async (req, res) => {
  const { team } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.customer_name 
       FROM projects p 
       JOIN customers c ON p.customer_id = c.customer_id 
       WHERE LOWER(p.responsible_team) LIKE ?`,
      [`%${team.toLowerCase().trim()}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/works/project/:project_id', async (req, res) => {
  const { project_id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT w.*,
      IF(
        (SELECT COUNT(*) FROM submitted_works sw WHERE sw.works_id = w.work_id AND sw.status = 'ผ่าน') > 0,
        'เสร็จสิ้น',
        w.status
      ) AS status
      FROM works w
      WHERE w.project_id = ?
    `, [project_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});


app.get('/api/employees/:username', async (req, res) => {
  const username = req.params.username
  try {
    const sql = `
      SELECT e.full_name, e.department, e.position
      FROM user_login_work u
      JOIN employee e ON u.employee_id = e.employee_id
      WHERE u.username = ?
    `
    const [rows] = await db.query(sql, [username])

    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      res.status(404).json({ message: 'ไม่พบข้อมูลพนักงานสำหรับ username นี้' })
    }
  } catch (error) {
    console.error('Error in /api/employees/:username:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
  }
});


//ดึงงานของเเต่ละไอดี
app.get('/api/works/user/:assigned_to', async (req, res) => {
  const { assigned_to } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT 
        w.work_id,
        w.works_name,
        w.price,
        w.description,
        w.due_date,
        w.work_type,
        w.status,
        p.project_name
      FROM works w
      JOIN projects p ON w.project_id = p.project_id
      WHERE w.assigned_to = ?`,
      [assigned_to]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching works:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/works/user/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT 
        w.work_id,
        w.works_name,
        w.description,
        w.price,
        w.due_date,
        IF(
          (SELECT COUNT(*) FROM submitted_works sw WHERE sw.works_id = w.work_id AND sw.status = 'ผ่าน') > 0,
          'เสร็จสิ้น',
          w.status
        ) AS status,
        p.project_name
      FROM works w
      JOIN projects p ON w.project_id = p.project_id
      WHERE w.assigned_to = ?`,
      [username]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching works:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// New dedicated endpoint for My Work page - reads status directly from database
app.get('/api/my-works/:username', async (req, res) => {
  const { username } = req.params;
  try {
    console.log(`[My Works] Fetching works for user: ${username}`);

    const [rows] = await db.query(
      `SELECT 
        w.work_id,
        w.works_name,
        w.work_type,
        w.description,
        w.price,
        w.due_date,
        w.status,
        w.project_id,
        p.project_name
      FROM works w
      JOIN projects p ON w.project_id = p.project_id
      WHERE w.assigned_to = ?
      ORDER BY 
        CASE w.status
          WHEN 'กำลังดำเนินการ' THEN 1
          WHEN 'รอดำเนินการ' THEN 2
          WHEN 'เสร็จสิ้น' THEN 3
          WHEN 'ยกเลิก' THEN 4
          ELSE 5
        END,
        w.due_date ASC`,
      [username]
    );

    console.log(`[My Works] Found ${rows.length} works for ${username}`);
    console.log('[My Works] Sample data:', rows.slice(0, 2));

    res.json(rows);
  } catch (err) {
    console.error('[My Works] Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//
// GET รอบส่งงานล่าสุด
app.get('/api/submit-work/latest-round/:username/:project_id/:works_id', async (req, res) => {
  const { username, project_id, works_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT MAX(round_number) AS latestRound
       FROM submitted_works
       WHERE username = ? AND project_id = ? AND works_id = ?`,
      [username, project_id, works_id]
    );

    res.json({ latestRound: rows[0].latestRound || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรอบส่งงาน' });
  }
});

// POST ส่งงาน
app.post('/api/submit-work', async (req, res) => {
  const { username, project_id, works_id, round_number, link } = req.body;

  try {
    // เช็คก่อนว่ารอบนี้มีอยู่แล้วหรือยัง
    const [existing] = await db.query(
      `SELECT 1 FROM submitted_works WHERE username = ? AND project_id = ? AND works_id = ? AND round_number = ?`,
      [username, project_id, works_id, round_number]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: `งานรอบที่ ${round_number} นี้ได้ส่งไปแล้ว` });
    }

    // Insert ถ้ายังไม่มี
    await db.query(
      `INSERT INTO submitted_works 
      (username, project_id, works_id, round_number, link, submitted_date, status) 
      VALUES (?, ?, ?, ?, ?, CURDATE(), 'รอดําเนินการ')`,
      [username, project_id, works_id, round_number, link]
    );

    res.json({ message: 'ส่งงานเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งงาน' });
  }
});

app.get('/api/works/inprogress/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT w.work_id AS works_id, w.works_name, w.project_id, p.project_name
       FROM works w
       JOIN projects p ON w.project_id = p.project_id
       WHERE w.assigned_to = ? 
         AND w.status = 'กำลังดำเนินการ'
         AND NOT EXISTS (
            SELECT 1 FROM submitted_works sw 
            WHERE sw.works_id = w.work_id AND sw.status = 'ผ่าน'
         )`,
      [username]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching works' });
  }
});


app.get('/api/submitted-works/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT sw.username, sw.project_id, p.project_name, 
              sw.works_id, w.works_name,
              sw.round_number, sw.link, sw.submitted_date, sw.status, sw.reviewer_comment
       FROM submitted_works sw
       LEFT JOIN projects p ON sw.project_id = p.project_id
       LEFT JOIN works w ON sw.works_id = w.work_id
       WHERE sw.username = ?`,
      [username]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching submitted works:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
});




app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT e.*
      FROM user_login_work u
      JOIN employee e ON u.employee_id = e.employee_id
      WHERE u.username = ?
    `, [username]);

    if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบข้อมูลพนักงาน' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ server' });
  }
});


//เพิ่มข้อมูลลูกค้า
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers');
    res.json(rows);
  } catch (error) {
    console.error('ดึงข้อมูลลูกค้าล้มเหลว:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customers', async (req, res) => {
  const { customer_name, gender, phone, other_contact, tax_id, billing_address, email } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO customers 
       (customer_name, gender, phone, other_contact, tax_id, billing_address, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, gender, phone, other_contact, tax_id, billing_address, email]
    );

    res.status(201).json({
      message: 'เพิ่มลูกค้าสำเร็จ',
      customer_id: result.insertId
    });

  } catch (err) {
    console.error('เพิ่มลูกค้าไม่สำเร็จ:', err);
    res.status(500).json({ error: 'เพิ่มลูกค้าไม่สำเร็จ' });
  }
});

// แก้ไขข้อมูลลูกค้า
app.put('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_name, gender, phone, other_contact, tax_id, billing_address, email } = req.body;
  try {
    await db.query(
      `UPDATE customers 
       SET customer_name = ?, gender = ?, phone = ?, other_contact = ?, tax_id = ?, billing_address = ?, email = ?
       WHERE customer_id = ?`,
      [customer_name, gender, phone, other_contact, tax_id, billing_address, email, id]
    );
    res.json({ message: 'แก้ไขข้อมูลลูกค้าสำเร็จ' });
  } catch (err) {
    console.error('แก้ไขลูกค้าไม่สำเร็จ:', err);
    res.status(500).json({ error: 'แก้ไขลูกค้าไม่สำเร็จ' });
  }
});

// ลบข้อมูลลูกค้า
app.delete('/api/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM customers WHERE customer_id = ?', [id]);
    res.json({ message: 'ลบลูกค้าสำเร็จ' });
  } catch (err) {
    console.error('ลบลูกค้าไม่สำเร็จ:', err);
    res.status(500).json({ error: 'ลบลูกค้าไม่สำเร็จ' });
  }
});



// ------------------ Employees Management ------------------

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employee ORDER BY employee_id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน' });
  }
});

// Add new employee with image upload
app.post('/api/employees', upload.single('profile_image'), async (req, res) => {
  const {
    employee_id, full_name, gender, age, birth_date, citizen_id,
    phone_number, start_date, resign_date, years_of_service,
    bank_account, current_salary, department, position, Google_drive
  } = req.body;

  const profile_image_url = req.file ? req.file.path : null;

  if (!employee_id || !full_name) {
    return res.status(400).json({ message: 'กรุณากรอกรหัสพนักงานและชื่อพนักงาน' });
  }

  try {
    // Normalize empty strings for date fields to NULL so MySQL DATE accepts them
    const birth_date_value = (birth_date && String(birth_date).trim() !== '') ? birth_date : null;
    const start_date_value = (start_date && String(start_date).trim() !== '') ? start_date : null;
    const resign_date_value = (resign_date && String(resign_date).trim() !== '') ? resign_date : null;
    const years_value = (years_of_service && String(years_of_service).trim() !== '') ? years_of_service : 0;
    const current_salary_value = (current_salary && String(current_salary).trim() !== '') ? current_salary : 0.00;

    await db.query(
      `INSERT INTO employee (
        employee_id, full_name, gender, age, birth_date, citizen_id, 
        phone_number, start_date, resign_date, years_of_service, 
        bank_account, current_salary, department, position, profile_image, Google_drive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id, full_name, gender, age, birth_date_value, citizen_id,
        phone_number, start_date_value, resign_date_value, years_value,
        bank_account, current_salary_value, department, position, profile_image_url, Google_drive
      ]
    );
    res.status(201).json({ message: 'เพิ่มพนักงานสำเร็จ' });
  } catch (err) {
    console.error('Error adding employee:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'รหัสพนักงานนี้มีอยู่แล้วในระบบ' });
    }
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน' });
  }
});

// Update employee with image upload
app.put('/api/employees/:id', upload.single('profile_image'), async (req, res) => {
  const { id } = req.params;
  const {
    full_name, gender, age, birth_date, citizen_id,
    phone_number, start_date, resign_date, years_of_service,
    bank_account, current_salary, department, position, Google_drive
  } = req.body;

  // Normalize empty strings for date fields to NULL and numeric defaults
  const birth_date_value = (birth_date && String(birth_date).trim() !== '') ? birth_date : null;
  const start_date_value = (start_date && String(start_date).trim() !== '') ? start_date : null;
  const resign_date_value = (resign_date && String(resign_date).trim() !== '') ? resign_date : null;
  const years_value = (years_of_service && String(years_of_service).trim() !== '') ? years_of_service : 0;
  const current_salary_value = (current_salary && String(current_salary).trim() !== '') ? current_salary : 0.00;

  let query = `UPDATE employee SET 
    full_name = ?, gender = ?, age = ?, birth_date = ?, citizen_id = ?, 
    phone_number = ?, start_date = ?, resign_date = ?, years_of_service = ?, 
    bank_account = ?, current_salary = ?, department = ?, position = ?, Google_drive = ?`;

  let params = [
    full_name, gender, age, birth_date_value, citizen_id,
    phone_number, start_date_value, resign_date_value, years_value,
    bank_account, current_salary_value, department, position, Google_drive
  ];

  if (req.file) {
    query += `, profile_image = ?`;
    params.push(req.file.path);
  }

  query += ` WHERE employee_id = ?`;
  params.push(id);

  try {
    await db.query(query, params);
    res.json({ message: 'แก้ไขข้อมูลพนักงานสำเร็จ' });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขพนักงาน' });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [users] = await db.query('SELECT 1 FROM user_login_work WHERE employee_id = ?', [id]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'ไม่สามารถลบได้ เนื่องจากพนักงานนี้มีบัญชีผู้ใช้งานระบบอยู่' });
    }
    await db.query('DELETE FROM employee WHERE employee_id = ?', [id]);
    res.json({ message: 'ลบพนักงานสำเร็จ' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบพนักงาน' });
  }
});

// ----------------------------------------------------------

//สําหรับหน้าตรวจสอบงาน
app.get('/api/submitted-works', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sw.*, 
             p.project_name, 
             w.works_name
      FROM submitted_works sw
      JOIN projects p ON sw.project_id = p.project_id
      JOIN works w ON sw.works_id = w.work_id
      ORDER BY sw.submitted_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});


app.put('/api/submitted-works/update', async (req, res) => {
  const { username, project_id, works_id, round_number, status, reviewer_comment, submitted_id, link } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. อัปเดต submitted_works รอบที่แก้ไข
    await conn.query(
      `UPDATE submitted_works 
       SET status = ?, reviewer_comment = ? 
       WHERE username = ? AND project_id = ? AND works_id = ? AND round_number = ?`,
      [status, reviewer_comment, username, project_id, works_id, round_number]
    );

    // 2. ถ้าสถานะเป็น 'ผ่าน' ให้ทำขั้นตอนเพิ่มเติมเหมือนหน้า Consider
    if (status === 'ผ่าน') {
      console.log(`[Update] Status is 'ผ่าน' for work ${works_id}. Syncing to works table...`);

      // อัปเดตสถานะงานย่อยเป็น 'เสร็จสิ้น'
      await conn.query(
        `UPDATE works SET status = 'เสร็จสิ้น' WHERE work_id = ?`,
        [works_id]
      );

      // บันทึกประวัติใน exported_works (ถ้ามีข้อมูล)
      if (submitted_id) {
        try {
          await conn.query(`
            INSERT IGNORE INTO exported_works 
            (submitted_id, username, project_id, works_id, round_number, link, reviewer_comment, review_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
            [submitted_id, username, project_id, works_id, round_number || 1, link || '', reviewer_comment]
          );
        } catch (e) {
          console.log('Exported works insert skipped:', e.message);
        }
      }

      // ตรวจสอบว่างานทั้งหมดในโปรเจกต์นี้เสร็จหรือยัง
      const [pendingRows] = await conn.query(
        `SELECT COUNT(*) as count FROM works 
         WHERE project_id = ? AND status NOT IN ('เสร็จสิ้น', 'ยกเลิก', 'ผ่าน')`,
        [project_id]
      );

      if (pendingRows[0].count === 0) {
        console.log(`All works for project ${project_id} are done. Updating project status...`);
        await conn.query(
          `UPDATE projects SET status = 'เสร็จสิ้น' WHERE project_id = ?`,
          [project_id]
        );
      }
    }

    await conn.commit();
    res.json({ message: 'อัปเดตสถานะเรียบร้อยและซิงค์ข้อมูลลงตารางหลักแล้ว' });
  } catch (error) {
    await conn.rollback();
    console.error('Update Submitted Work Error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  } finally {
    conn.release();
  }
});


app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT customer_id, customer_name FROM customers');
    res.json(rows);
  } catch (err) {
    console.error('ดึงข้อมูลลูกค้าล้มเหลว:', err);
    res.status(500).json({ message: 'ดึงข้อมูลลูกค้าล้มเหลว' });
  }
});

// 📌 API เพิ่มโปรเจคใหม่
app.post('/api/projects', async (req, res) => {
  try {
    const { project_name, customer_id, price, responsible_team, status, due_date } = req.body;

    if (!project_name || !customer_id || !price || !responsible_team || !status || !due_date) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // สร้าง project_id อัตโนมัติ เช่น TK001
    const [last] = await db.query('SELECT project_id FROM projects WHERE project_id LIKE "TK%" ORDER BY project_id DESC LIMIT 1');
    let newId = 'TK001';
    if (last.length > 0) {
      const num = parseInt(last[0].project_id.replace('TK', ''), 10) + 1;
      newId = 'TK' + num.toString().padStart(3, '0');
    }

    await db.query(
      `INSERT INTO projects (project_id, project_name, customer_id, price, responsible_team, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newId, project_name, customer_id, price, responsible_team, status, due_date]
    );

    res.json({ message: 'เพิ่มโปรเจคสำเร็จ', project_id: newId });
  } catch (err) {
    console.error('เพิ่มโปรเจคล้มเหลว:', err);
    res.status(500).json({ message: 'เพิ่มโปรเจคล้มเหลว' });
  }
});

app.get('/api/projects/all', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.customer_name 
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.customer_id
      ORDER BY p.project_id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all projects:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจกต์ทั้งหมด' });
  }
});

// ลบโปรเจกต์ตาม project_id
app.delete('/api/projects/:id', async (req, res) => {
  const projectId = req.params.id;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. ลบงานย่อยที่เกี่ยวข้อง (Works) ก่อน
    await conn.query('DELETE FROM works WHERE project_id = ?', [projectId]);

    // 2. ลบโปรเจกต์
    const [result] = await conn.query('DELETE FROM projects WHERE project_id = ?', [projectId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'ไม่พบโปรเจกต์ที่ต้องการลบ' });
    }

    await conn.commit();
    res.json({ message: 'ลบโปรเจกต์และงานย่อยที่เกี่ยวข้องเรียบร้อยแล้ว' });

  } catch (error) {
    await conn.rollback();
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบโปรเจกต์' });
  } finally {
    conn.release();
  }
});


//โพสงานย่อย
function getPrefix(workType) {
  switch (workType) {
    case 'แผ่นอะคริลิกตัดตรงหรือเลเซอร์': return 'AL';
    case 'ฟิล์มโปร่งแสง ': return 'BL';
    case 'แผ่นพับประชาสัมพันธ์': return 'BR';
    case 'งานตัดพลาสวูด': return 'CNC-PW';
    case 'งานตัดอะคริลิก': return 'CNC-AL';
    case 'สติ๊กเกอร์ไดคัททั่วไป / ฉลากสินค้า / ตัวอักษร': return 'STK-DC';
    case 'แผ่นแจกโฆษณา 1 หน้า / ใบปลิว 1 หรือ 2 หน้า': return 'FL';
    case 'การ์ดเชิญงานแต่ง, งานบวช ฯลฯ': return 'GC';
    case 'ไฟล์โลโก้ที่ใช้ในงานพิมพ์หรือออกแบบ': return 'LG';
    case 'ยิงเลเซอร์แกะลายบนสแตนเลส': return 'LS-ENG';
    case 'ตู้ไฟติดฟิล์มหรือสติ๊กเกอร์โปร่งแสง': return 'LB';
    case 'พิมพ์นามบัตร 1 หน้า / 2 หน้า': return 'NC';
    case 'กระดาษพีพีกันน้ำ': return 'PP';
    case 'แผ่นพลาสวูดหนา': return 'PW';
    case 'ตรายางหมึกในตัว หรือหมึกแยก': return 'RM';
    case 'ป้ายสแตนเลสกัดกรด': return 'SS-ET';
    case 'งานพิมพ์ลงบนวัสดุ PVC มีด้านเงา/ด้าน': return 'STK';
    case 'สติ๊กเกอร์ติดแผ่นอะคริลิก': return 'STK-AL';
    case 'สติ๊กเกอร์ฝ้า': return 'STK-FR';
    case 'สติ๊กเกอร์ซีทรู': return 'STK-C2';
    case 'ปริ้นสติ๊กเกอร์ติดโฟมบอร์ด': return 'STK-FB';
    case 'สติ๊กเกอร์ติดแผ่น PP Board / ฟิวเจอร์บอร์ด': return 'STK-PP';
    case 'สติ๊กเกอร์ติดแผ่นพลาสวูด': return 'STK-PW';
    case 'สติ๊กเกอร์ติดสินค้า เช่น ขวดน้ำ, กล่องขนม': return 'STL';
    case 'ธงราวพิมพ์ผ้า/ไวนิล แขวนตกแต่ง': return 'TF';
    case 'ป้ายสามเหลี่ยมตั้งพื้น พลาสวูด': return 'TPW';
    case 'การพิมพ์ระบบแห้งด้วยรังสียูวี': return 'UV';
    case 'วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่': return 'VN';


    default: return 'TK';
  }
}

// ฟังก์ชันสุ่มเลข 3 หลัก
function randomThreeDigits() {
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

// ฟังก์ชันสร้าง work_id ที่ไม่ซ้ำ
async function generateUniqueWorkId(workType) {
  const prefix = getPrefix(workType);
  let workId;
  let isUnique = false;

  while (!isUnique) {
    const randomNum = randomThreeDigits();
    workId = prefix + randomNum;

    const [rows] = await db.query('SELECT work_id FROM works WHERE work_id = ?', [workId]);
    if (rows.length === 0) {
      isUnique = true;
    }
  }
  return workId;
}

// API เพิ่มงานย่อย
app.post('/api/works', async (req, res) => {
  try {
    const { works_name, work_type, project_id, price, description, assigned_to, due_date, status } = req.body;

    if (!works_name || !work_type || !project_id || !assigned_to || !due_date || !status) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const work_id = await generateUniqueWorkId(work_type);

    await db.query(
      `INSERT INTO works 
       (work_id, works_name, work_type, project_id, price, description, assigned_to, due_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [work_id, works_name, work_type, project_id, price || 0.00, description || '', assigned_to, due_date, status]
    );

    res.json({ message: 'เพิ่มงานย่อยสำเร็จ', work_id });
  } catch (err) {
    console.error('เพิ่มงานย่อยล้มเหลว:', err);
    res.status(500).json({ message: 'เพิ่มงานย่อยล้มเหลว' });
  }
});


// ดึงรายชื่อพนักงานพร้อม username ที่ผูกไว้
app.get('/api/employees-with-users', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.employee_id, e.full_name, u.username, u.team
      FROM employee e
      LEFT JOIN user_login_work u 
        ON e.employee_id = u.employee_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employees with users:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลพนักงานได้' });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT team FROM user_login_work
      WHERE team IS NOT NULL AND team <> ''
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลทีมได้' });
  }
});

// ดึงพนักงานตามทีม
app.get('/api/employees-by-team/:team', async (req, res) => {
  try {
    const { team } = req.params;
    const [rows] = await db.query(`
      SELECT e.employee_id, e.full_name, u.username
      FROM employee e
      JOIN user_login_work u ON e.employee_id = u.employee_id
      WHERE u.team = ?
    `, [team]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching employees by team:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลพนักงานตามทีมได้' });
  }
});



app.get('/api/projects/inprogress', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT project_id, project_name, customer_id, price, responsible_team, due_date, status
       FROM projects
       WHERE status = ?
       ORDER BY (due_date IS NULL), due_date ASC, project_id DESC`,
      ['กำลังดำเนินการ']
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching in-progress projects:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจกต์' });
  }
});


app.get('/api/projects/team/:team/inprogress', async (req, res) => {
  const { team } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT project_id, project_name, customer_id, price, responsible_team, due_date, status
       FROM projects
       WHERE status = ? AND FIND_IN_SET(?, responsible_team)
       ORDER BY (due_date IS NULL), due_date ASC, project_id DESC`,
      ['กำลังดำเนินการ', team]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching in-progress projects by team:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรเจกต์ตามทีม' });
  }
});



app.get('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;

  if (!['projects', 'works', 'customers'].includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  try {
    let query = '';
    let params = [id];

    if (table === 'projects') {
      query = `
        SELECT project_id, project_name, customer_id, price, responsible_team, 
          DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date, status 
        FROM projects WHERE project_id = ?`;
    } else if (table === 'works') {
      query = `
        SELECT work_id, works_name, work_type, project_id, price, description, assigned_to, 
          DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date, 
          IF(
            (SELECT COUNT(*) FROM submitted_works sw WHERE sw.works_id = works.work_id AND sw.status = 'ผ่าน') > 0,
            'เสร็จสิ้น',
            status
          ) AS status
        FROM works WHERE work_id = ?`;
    } else if (table === 'customers') {
      // สมมติ customers ไม่มีคอลัมน์วันที่ หรือแก้ไขตามจริงถ้ามี
      query = `SELECT * FROM customers WHERE customer_id = ?`;
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: `${table} not found` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  const data = req.body;

  if (!['projects', 'works', 'customers'].includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  let idColumn;
  if (table === 'projects') idColumn = 'project_id';
  else if (table === 'works') idColumn = 'work_id';
  else if (table === 'customers') idColumn = 'customer_id';

  try {
    // แปลงวันที่ใน data ก่อนอัพเดต (เฉพาะ field ที่เป็นวันที่)
    ['due_date', 'date', 'created_at', 'updated_at'].forEach(field => {
      if (data[field]) {
        const d = new Date(data[field]);
        if (!isNaN(d.getTime())) {
          data[field] = d.toISOString().split('T')[0];
        }
      }
    });

    // กรอง Primary Key ออก (ไม่ให้อัปเดต ID)
    let fields = Object.keys(data).filter(field => field !== idColumn);

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No data to update' });
    }

    console.log(`\n=== UPDATE ${table} ===`);
    console.log(`ID: ${idColumn} = ${id}`);
    console.log(`Fields to update:`, fields);

    // สร้าง SET clause แบบ dynamic
    const setClause = fields.map(field => `?? = ?`).join(', ');
    const values = [];
    fields.forEach(field => {
      values.push(field, data[field]);
    });

    // กำหนด SQL update statement ตรงนี้
    const sql = `UPDATE ?? SET ${setClause} WHERE ?? = ?`;

    // กำหนด params สำหรับ pool.query
    const params = [table, ...values, idColumn, id];

    console.log('Update SQL:', sql);
    console.log('Update Params:', params);

    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `${table} with id ${id} not found` });
    }

    res.json({ message: 'Update successful' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
});

//ดึงลูกค้าหน้าแก้ไข
// ดึงข้อมูลลูกค้าตาม id
app.get('/api/customers/:id', async (req, res) => {
  const customerId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT customer_id, customer_name, gender, phone, other_contact, tax_id, billing_address, email
       FROM customers 
       WHERE customer_id = ?`,
      [customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลลูกค้า' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า' });
  }
});

// อัปเดตข้อมูลลูกค้าตาม id
app.put('/api/customers/:id', async (req, res) => {
  const customerId = req.params.id;
  const { customer_name, gender, phone, other_contact, tax_id, billing_address, email } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE customers 
       SET customer_name = ?, gender = ?, phone = ?, other_contact = ?, tax_id = ?, billing_address = ?, email = ?
       WHERE customer_id = ?`,
      [customer_name, gender, phone, other_contact, tax_id, billing_address, email, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบลูกค้าเพื่อแก้ไข' });
    }

    res.json({ message: 'แก้ไขข้อมูลลูกค้าสำเร็จ' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลลูกค้า' });
  }
});


app.get('/api/works/:id', async (req, res) => {
  const workId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT work_id, works_name, work_type, project_id,
              IFNULL(price, 0.00) AS price,  -- ป้องกัน NULL
              description, assigned_to,
              DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
              status
       FROM works
       WHERE work_id = ?`,
      [workId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลงานย่อย' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching work:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลงานย่อย' });
  }
});

// แก้ไขข้อมูลงานย่อยตาม work_id
app.put('/api/works/:id', async (req, res) => {
  const workId = req.params.id;
  const { works_name, work_type, description, assigned_to, price, due_date, status } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE works 
       SET works_name = ?, work_type = ?,price = ?, description = ?, assigned_to = ?, due_date = ?, status = ? 
       WHERE work_id = ?`,
      [works_name, work_type, description, assigned_to, price, due_date, status, workId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบงานย่อยเพื่อแก้ไข' });
    }

    res.json({ message: 'แก้ไขข้อมูลงานย่อยสำเร็จ' });
  } catch (error) {
    console.error('Error updating work:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลงานย่อย' });
  }
});

// ลบงานย่อยตาม work_id
app.delete('/api/works/:id', async (req, res) => {
  const workId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM works WHERE work_id = ?', [workId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบงานย่อยที่ต้องการลบ' });
    }

    res.json({ message: 'ลบงานย่อยเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting work:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบงานย่อย' });
  }
});

// ดึงงานที่ status = 'ผ่าน' ทั้งหมด
app.get('/api/submitted-works/P', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM submitted_works
      WHERE status = 'ผ่าน'
    `);

    if (rows.length === 0) {
      // กรณีไม่มีงานที่ผ่าน
      return res.status(404).json({ error: 'ไม่พบงานที่ผ่านการตรวจสอบ' });
    }

    console.log('Passed works:', rows); // debug: ตรวจสอบข้อมูลที่ดึงมา
    res.json(rows); // ส่งกลับทั้งหมดเป็น array
  } catch (error) {
    console.error('Error fetching passed works:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลงานที่ผ่าน' });
  }
});

// บันทึกงานที่ผ่านเข้า reviewed_works
app.post('/api/reviewed-works', async (req, res) => {
  const { submitted_id, username, project_id, works_id, round_number, reviewer_comment, link } = req.body;

  try {
    await pool.query(
      `INSERT INTO reviewed_works 
       (submitted_id, username, project_id, works_id, round_number, link, review_date, status, reviewer_comment)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'ผ่าน', ?)`,
      [submitted_id, username, project_id, works_id, round_number, link, reviewer_comment]
    );

    res.json({ message: 'บันทึกผลการตรวจสอบเรียบร้อย' });
  } catch (error) {
    console.error('Insert reviewed_works error:', error);
    res.status(500).json({ error: 'Insert error' });
  }
});


// อัปเดตงานเป็นไม่ผ่าน โดยใช้ submitted_id
app.put('/api/submitted-works/fail/:submitted_id', async (req, res) => {
  const { submitted_id } = req.params;
  const { reviewer_comment } = req.body;
  try {
    await pool.query(
      `UPDATE submitted_works 
       SET status = 'ไม่ผ่าน', reviewer_comment = ? 
       WHERE submitted_id = ?`,
      [reviewer_comment, submitted_id]
    );
    res.json({ message: 'อัปเดตสถานะเป็นไม่ผ่านแล้ว' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update error' });
  }
});

app.get('/api/submitted-works/all', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM submitted_works
      ORDER BY submitted_date DESC
    `);
    console.log('All submitted works:', rows); // debug
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/reviewed-works', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        rw.review_id,
        rw.submitted_id,
        rw.username,
        rw.project_id,
        p.project_name,
        rw.works_id,
        w.works_name,
        rw.round_number,
        rw.link,
        rw.review_date,
        rw.status,
        rw.reviewer_comment
      FROM reviewed_works rw
      JOIN projects p ON rw.project_id = p.project_id
      JOIN works w ON rw.works_id = w.work_id
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching reviewed_works:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/exported_works
app.post('/api/exported_works', async (req, res) => {
  const { review_id, submitted_id, username, project_id, works_id, round_number, link, reviewer_comment } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. ย้ายงานไป exported_works
    await conn.query(`
      INSERT INTO exported_works 
      (submitted_id, username, project_id, works_id, round_number, link, reviewer_comment)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [submitted_id, username, project_id, works_id, round_number, link, reviewer_comment]
    );

    // 2. ลบงานออกจาก reviewed_works
    await conn.query(`DELETE FROM reviewed_works WHERE review_id = ?`, [review_id]);

    // 3. ตรวจสอบสถานะของ submitted_works ทั้งหมดของ works_id นี้
    const [rows] = await conn.query(
      `SELECT status FROM submitted_works WHERE works_id = ?`,
      [works_id]
    );

    // กำหนดสถานะของ works ตามสถานะของ submitted_works
    let worksStatus = 'เสร็จสิ้น';
    for (const row of rows) {
      if (row.status === 'ไม่ผ่าน' || row.status === 'รอดําเนินการ') {
        worksStatus = 'กำลังดำเนินการ';
        break;
      }
    }

    // 4. อัปเดตสถานะในตาราง works
    await conn.query(
      `UPDATE works 
       SET status = ? 
       WHERE work_id = ? AND project_id = ?`,
      [worksStatus, works_id, project_id]
    );

    await conn.commit();
    res.json({ message: 'ย้ายงานสำเร็จและอัปเดตสถานะ works แล้ว' });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการย้ายงาน' });
  } finally {
    conn.release();
  }
});

app.get('/api/submitted-works/pending-safe', async (req, res) => {
  try {
    // ใช้ CAST เพื่อให้ชนิดข้อมูลตรงกันระหว่างตาราง
    const [rows] = await pool.query(`
      SELECT sw.*
      FROM submitted_works sw
      LEFT JOIN reviewed_works rw 
        ON CAST(sw.submitted_id AS CHAR) = CAST(rw.submitted_id AS CHAR)
      WHERE rw.submitted_id IS NULL
        AND sw.status = 'ผ่าน'
      ORDER BY sw.submitted_id ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching pending works safely:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/exported-works', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ew.export_id AS review_id, ew.submitted_id, ew.username, 
             ew.project_id, ew.works_id, ew.round_number,
             ew.link,  -- ดึงลิงก์จาก exported_works โดยตรง
             ew.review_date, ew.status, ew.reviewer_comment,
             p.project_name, w.works_name
      FROM exported_works ew
      LEFT JOIN projects p ON ew.project_id = p.project_id
      LEFT JOIN works w ON ew.works_id = w.work_id
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching exported works:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ดึง reviewed_works ทั้งหมด
app.get('/api/reviewed-works', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT review_id, submitted_id, username, project_id, works_id, round_number,
             link, review_date, status, reviewer_comment
      FROM reviewed_works
    `);

    console.log('Reviewed works count:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});



// This endpoint approves work directly, skipping reviewed_works table
app.post('/api/approve-work-direct', async (req, res) => {
  const { submitted_id, username, project_id, works_id, round_number, link, reviewer_comment } = req.body;

  try {
    console.log('Direct Approval Request:', req.body);

    // 1. อัปเดตสถานะใน submitted_works เป็น 'ผ่าน' (สำคัญ)
    await db.query(
      `UPDATE submitted_works SET status = 'ผ่าน' WHERE submitted_id = ?`,
      [submitted_id]
    );

    // 2. Insert into exported_works (Archiving)
    try {
      await db.query(`
          INSERT INTO exported_works 
          (submitted_id, username, project_id, works_id, round_number, link, reviewer_comment, review_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [submitted_id, username, project_id, works_id, round_number, link, reviewer_comment]
      );
    } catch (e) {
      console.log('Exported works insert skipped (maybe duplicate):', e.message);
    }

    // 3. Mark the Work as 'เสร็จสิ้น' immediately
    console.log(`Attempting to update work status: work_id=${works_id} to 'เสร็จสิ้น'`);

    // ตรวจสอบก่อนว่ามีงานนี้จริงหรือไม่
    const [checkWork] = await db.query(
      `SELECT work_id, status FROM works WHERE work_id = ?`,
      [works_id]
    );
    console.log('Current work before update:', checkWork);

    if (checkWork.length === 0) {
      console.error(`ERROR: Work with work_id=${works_id} not found!`);
      return res.status(404).json({ error: `งาน work_id=${works_id} ไม่พบในระบบ` });
    }

    // อัปเดตสถานะ
    const [wRes] = await db.query(
      `UPDATE works SET status = 'เสร็จสิ้น' WHERE work_id = ?`,
      [works_id]
    );
    console.log('Work status update result:', { affectedRows: wRes.affectedRows, changedRows: wRes.changedRows });

    if (wRes.affectedRows === 0) {
      console.error(`WARNING: No rows affected when updating work_id=${works_id}`);
    }

    // ตรวจสอบหลังอัปเดต
    const [verifyWork] = await db.query(
      `SELECT work_id, status FROM works WHERE work_id = ?`,
      [works_id]
    );
    console.log('Work after update:', verifyWork);

    // 4. Check if ALL works in this project are 'เสร็จสิ้น' or 'ยกเลิก'
    // If so, mark the Project as 'เสร็จสิ้น'
    const [pendingRows] = await db.query(
      `SELECT COUNT(*) as count FROM works 
       WHERE project_id = ? AND status NOT IN ('เสร็จสิ้น', 'ยกเลิก', 'ผ่าน')`,
      [project_id]
    );

    if (pendingRows[0].count === 0) {
      console.log(`All works for project ${project_id} are done. Updating project status...`);
      await db.query(
        `UPDATE projects SET status = 'เสร็จสิ้น' WHERE project_id = ?`,
        [project_id]
      );
    }

    res.json({ message: 'อนุมัติงานและบันทึกเรียบร้อย' });

  } catch (err) {
    console.error('Approve Work Direct Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอนุมัติงาน' });
  }
});

// ----- SPA Fallback: ใช้ RegExp แทน "*" -----
//app.get(/.*/, (req, res) => {
 // res.sendFile(path.join(STATIC_PATH, "index.html"));
//});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

