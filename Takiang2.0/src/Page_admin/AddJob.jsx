import React, { useState, useEffect } from 'react';
import axios from 'axios';
import feather from 'feather-icons';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';
import Swal from 'sweetalert2';
import Select from 'react-select';

function AddSubWork() {
  const [projects, setProjects] = useState([]);

  const graphicsWorkTypes = [
    { value: "แผ่นอะคริลิกตัดตรงหรือเลเซอร์", label: "แผ่นอะคริลิกตัดตรงหรือเลเซอร์" },
    { value: "ฟิล์มโปร่งแสง ", label: "ฟิล์มโปร่งแสง " },
    { value: "แผ่นพับประชาสัมพันธ์", label: "แผ่นพับประชาสัมพันธ์" },
    { value: "งานตัดพลาสวูด", label: "งานตัดพลาสวูด" },
    { value: "งานตัดอะคริลิก", label: "งานตัดอะคริลิก" },
    { value: "สติ๊กเกอร์ไดคัททั่วไป / ฉลากสินค้า / ตัวอักษร", label: "สติ๊กเกอร์ไดคัททั่วไป / ฉลากสินค้า / ตัวอักษร" },
    { value: "แผ่นแจกโฆษณา 1 หน้า / ใบปลิว 1 หรือ 2 หน้า", label: "แผ่นแจกโฆษณา 1 หน้า / ใบปลิว 1 หรือ 2 หน้า" },
    { value: "การ์ดเชิญงานแต่ง, งานบวช ฯลฯ", label: "การ์ดเชิญงานแต่ง, งานบวช ฯลฯ" },
    { value: "ไฟล์โลโก้ที่ใช้ในงานพิมพ์หรือออกแบบ", label: "ไฟล์โลโก้ที่ใช้ในงานพิมพ์หรือออกแบบ" },
    { value: "ยิงเลเซอร์แกะลายบนสแตนเลส", label: "ยิงเลเซอร์แกะลายบนสแตนเลส" },
    { value: "ตู้ไฟติดฟิล์มหรือสติ๊กเกอร์โปร่งแสง", label: "ตู้ไฟติดฟิล์มหรือสติ๊กเกอร์โปร่งแสง" },
    { value: "พิมพ์นามบัตร 1 หน้า / 2 หน้า", label: "พิมพ์นามบัตร 1 หน้า / 2 หน้า" },
    { value: "กระดาษพีพีกันน้ำ", label: "กระดาษพีพีกันน้ำ" },
    { value: "แผ่นพลาสวูดหนา", label: "แผ่นพลาสวูดหนา" },
    { value: "ตรายางหมึกในตัว หรือหมึกแยก", label: "ตรายางหมึกในตัว หรือหมึกแยก" },
    { value: "ป้ายสแตนเลสกัดกรด", label: "ป้ายสแตนเลสกัดกรด" },
    { value: "งานพิมพ์ลงบนวัสดุ PVC มีด้านเงา/ด้าน", label: "งานพิมพ์ลงบนวัสดุ PVC มีด้านเงา/ด้าน" },
    { value: "สติ๊กเกอร์ติดแผ่นอะคริลิก", label: "สติ๊กเกอร์ติดแผ่นอะคริลิก" },
    { value: "สติ๊กเกอร์ฝ้า ", label: "สติ๊กเกอร์ฝ้า " },
    { value: "สติ๊กเกอร์ซีทรู", label: "สติ๊กเกอร์ซีทรู" },
    { value: "ปริ้นสติ๊กเกอร์ติดโฟมบอร์ด", label: "ปริ้นสติ๊กเกอร์ติดโฟมบอร์ด" },
    { value: "สติ๊กเกอร์ติดแผ่น PP Board / ฟิวเจอร์บอร์ด", label: "สติ๊กเกอร์ติดแผ่น PP Board / ฟิวเจอร์บอร์ด" },
    { value: "สติ๊กเกอร์ติดแผ่นพลาสวูด", label: "สติ๊กเกอร์ติดแผ่นพลาสวูด" },
    { value: "สติ๊กเกอร์ติดสินค้า เช่น ขวดน้ำ, กล่องขนม", label: "สติ๊กเกอร์ติดสินค้า เช่น ขวดน้ำ, กล่องขนม" },
    { value: "ธงราวพิมพ์ผ้า/ไวนิล แขวนตกแต่ง", label: "ธงราวพิมพ์ผ้า/ไวนิล แขวนตกแต่ง" },
    { value: "ป้ายสามเหลี่ยมตั้งพื้น พลาสวูด", label: "ป้ายสามเหลี่ยมตั้งพื้น พลาสวูด" },
    { value: "การพิมพ์ระบบแห้งด้วยรังสียูวี", label: "การพิมพ์ระบบแห้งด้วยรังสียูวี" },
    { value: "วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่", label: "วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่" },
  ];

  const marketingWorkTypes = [
    { value: "ยิงโฆษณา Facebook Ads / Instagram Ads", label: "ยิงโฆษณา Facebook Ads / Instagram Ads" },
    { value: "ยิงโฆษณา Google Ads / YouTube Search", label: "ยิงโฆษณา Google Ads / YouTube Search" },
    { value: "ยิงโฆษณา TikTok Shop / Shopee / Lazada", label: "ยิงโฆษณา TikTok Shop / Shopee / Lazada" },
    { value: "ทำคอนเทนต์ TikTok / Reels / Short Video", label: "ทำคอนเทนต์ TikTok / Reels / Short Video" },
    { value: "ออกแบบ Content Marketing / Ads Graphic", label: "ออกแบบ Content Marketing / Ads Graphic" },
    { value: "เขียนบทความ SEO / Copywriting โปรโมตสินค้า", label: "เขียนบทความ SEO / Copywriting โปรโมตสินค้า" },
    { value: "แอดมินดูแลเพจ / ตอบแชทลูกค้า / ปิดการขาย", label: "แอดมินดูแลเพจ / ตอบแชทลูกค้า / ปิดการขาย" },
    { value: "วางแผนกลยุทธ์การตลาดประจำสัปดาห์/เดือน", label: "วางแผนกลยุทธ์การตลาดประจำสัปดาห์/เดือน" },
    { value: "วิเคราะห์ข้อมูลเชิงลึกและรายงานผลการขาย", label: "วิเคราะห์ข้อมูลเชิงลึกและรายงานผลการขาย" },
    { value: "จัดกิจกรรมทางการตลาด / โปรโมชั่น / แคมเปญ", label: "จัดกิจกรรมทางการตลาด / โปรโมชั่น / แคมเปญ" },
    { value: "ดูแลระบบหลังบ้านเว็บไซต์ / Landing Page", label: "ดูแลระบบหลังบ้านเว็บไซต์ / Landing Page" },
  ];

  const adminWorkTypes = [
    { value: "ประสานงานระหว่างลูกค้าและทีมผลิต", label: "ประสานงานระหว่างลูกค้าและทีมผลิต" },
    { value: "จัดทำใบเสนอราคา (Quotation) / ใบสั่งซื้อ", label: "จัดทำใบเสนอราคา (Quotation) / ใบสั่งซื้อ" },
    { value: "ออกใบกำกับภาษี / ใบเสร็จรับเงิน / ใบส่งสินค้า", label: "ออกใบกำกับภาษี / ใบเสร็จรับเงิน / ใบส่งสินค้า" },
    { value: "ตรวจสอบรายการสต็อกสินค้าและวัสดุอุปกรณ์", label: "ตรวจสอบรายการสต็อกสินค้าและวัสดุอุปกรณ์" },
    { value: "บริหารจัดการงบประมาณและสรุปค่าใช้จ่ายโปรเจกต์", label: "บริหารจัดการงบประมาณและสรุปค่าใช้จ่ายโปรเจกต์" },
    { value: "วางแผนตารางคิวรถส่งของและบริหาร Logistic", label: "วางแผนตารางคิวรถส่งของและบริหาร Logistic" },
    { value: "ประสานงานซัพพลายเออร์และสั่งซื้อวัสดุ", label: "ประสานงานซัพพลายเออร์และสั่งซื้อวัสดุ" },
    { value: "ตรวจสอบความถูกต้องของงานพิมพ์ก่อนส่งลูกค้า", label: "ตรวจสอบความถูกต้องของงานพิมพ์ก่อนส่งลูกค้า" },
    { value: "จัดการเอกสารสัญญาและงานธุรการทั่วไป", label: "จัดการเอกสารสัญญาและงานธุรการทั่วไป" },
    { value: "รวบรวมข้อมูลพนักงานและเช็คตารางทำงาน", label: "รวบรวมข้อมูลพนักงานและเช็คตารางทำงาน" },
  ];

  const allWorkTypes = [...graphicsWorkTypes, ...marketingWorkTypes, ...adminWorkTypes];

  const [displayWorkTypes, setDisplayWorkTypes] = useState(allWorkTypes);

  const [formData, setFormData] = useState({
    works_name: '',
    work_type: '',
    project_id: '',
    description: '',
    assigned_to: '',
    due_date: '',
    price: '',
    status: 'เลือกสถานะ',
    team: ''
  });

  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    feather.replace();
    fetchProjects();
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get('/api/employees-with-users');
      setAllEmployees(res.data);
    } catch (err) {
      console.error('โหลดข้อมูลพนักงานล้มเหลว:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects/inprogress');
      setProjects(res.data);
    } catch (err) {
      console.error('โหลดโปรเจกต์ล้มเหลว:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'project_id' || name === 'assigned_to') {
      const currentProjectId = name === 'project_id' ? value : formData.project_id;
      const currentAssignedTo = name === 'assigned_to' ? value : formData.assigned_to;

      const selectedProject = projects.find(p => p.project_id === currentProjectId);
      const selectedEmployee = allEmployees.find(emp => emp.username === currentAssignedTo);

      if (selectedProject) {
        const projectTeams = selectedProject.responsible_team ? selectedProject.responsible_team.split(',') : [];

        // 1. Filter employees based on project teams
        const filtered = allEmployees.filter(emp => projectTeams.includes(emp.team));
        setFilteredEmployees(filtered);

        // 2. Determine work types to display
        let targetTeams = [];
        if (selectedEmployee && projectTeams.includes(selectedEmployee.team)) {
          // If an employee is selected, focus on THEIR team
          targetTeams = [selectedEmployee.team];
        } else {
          // Otherwise, show work types for ALL teams in the project
          targetTeams = projectTeams;
        }

        let combinedTypes = [];
        if (targetTeams.includes('graphics')) combinedTypes = [...combinedTypes, ...graphicsWorkTypes];
        if (targetTeams.includes('marketing')) combinedTypes = [...combinedTypes, ...marketingWorkTypes];
        if (targetTeams.includes('admin')) combinedTypes = [...combinedTypes, ...adminWorkTypes];

        const uniqueTypes = Array.from(new Set(combinedTypes.map(t => JSON.stringify(t)))).map(t => JSON.parse(t));
        setDisplayWorkTypes([
          ...uniqueTypes,
          { value: 'ADD_NEW_TYPE', label: '➕ เพิ่มประเภทงานใหม่...', color: '#4a90e2' }
        ]);

        // Reset fields if relevant
        if (name === 'project_id') {
          setFormData(prev => ({ ...prev, assigned_to: '', work_type: '' }));
        }
      } else {
        setFilteredEmployees([]);
        setDisplayWorkTypes(allWorkTypes);
        if (name === 'project_id') {
          setFormData(prev => ({ ...prev, assigned_to: '', work_type: '' }));
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find team for the assigned employee to persist it if needed by the backend
      const assignedEmp = allEmployees.find(emp => emp.username === formData.assigned_to);
      const submitData = { ...formData, team: assignedEmp ? assignedEmp.team : '' };

      await axios.post('/api/works', submitData);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มงานย่อยเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });
      setFormData({
        works_name: '',
        work_type: '',
        price: '',
        project_id: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'เลือกสถานะ',
        team: ''
      });
      setFilteredEmployees([]);
    } catch (err) {
      console.error('เพิ่มงานย่อยล้มเหลว:', err);
      Swal.fire({
        title: 'ผิดพลาด!',
        text: 'ไม่สามารถเพิ่มงานย่อยได้',
        icon: 'error',
        confirmButtonText: 'ปิด'
      });
    }
  };

  const handleWorkTypeChange = async (selected) => {
    if (selected?.value === 'ADD_NEW_TYPE') {
      const { value: newType } = await Swal.fire({
        title: 'เพิ่มประเภทงานใหม่',
        input: 'text',
        inputLabel: 'ชื่อประเภทงาน',
        inputPlaceholder: 'ระบุชื่อประเภทงานที่ต้องการเพิ่ม...',
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        inputValidator: (value) => {
          if (!value) {
            return 'กรุณากรอกชื่อประเภทงาน';
          }
        }
      });

      if (newType) {
        const newOption = { value: newType, label: newType, isCustom: true };
        setDisplayWorkTypes(prev => {
          const updated = [...prev];
          updated.splice(updated.length - 1, 0, newOption);
          return updated;
        });
        setFormData(prev => ({ ...prev, work_type: newType }));
      }
    } else {
      setFormData(prev => ({ ...prev, work_type: selected?.value || '' }));
    }
  };

  const handleDeleteType = (e, typeValue) => {
    e.stopPropagation();
    Swal.fire({
      title: 'ลบประเภทงาน?',
      text: `คุณต้องการลบ "${typeValue}" ออกจากรายการใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        setDisplayWorkTypes(prev => prev.filter(opt => opt.value !== typeValue));
        if (formData.work_type === typeValue) {
          setFormData(prev => ({ ...prev, work_type: '' }));
        }
      }
    });
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card form-card">
          <div className="form-header">
            <i data-feather="file-plus"></i>
            <h2>เพิ่มงานย่อย</h2>
          </div>

          <form onSubmit={handleSubmit} className="user-form">

            <div className="form-group">
              <label>โปรเจกต์</label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                required
              >
                <option value="">-- เลือกโปรเจกต์ --</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>ผู้รับผิดชอบ</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                required
                disabled={!formData.project_id}
              >
                <option value="">-- เลือกผู้รับผิดชอบ --</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.employee_id} value={emp.username}>
                    {emp.full_name} ({emp.username}) - ทีม {emp.team}
                  </option>
                ))}
              </select>
            </div>


            <div className="form-group">
              <label>ชื่องาน</label>
              <input
                type="text"
                name="works_name"
                autoComplete="off"
                value={formData.works_name}
                onChange={handleChange}
                required
              />
            </div>

            {/* ประเภทงาน */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label>ประเภทงาน</label>
              <Select
                options={displayWorkTypes}
                value={displayWorkTypes.find(opt => opt.value === formData.work_type) || null}
                onChange={handleWorkTypeChange}
                placeholder="-- เลือกประเภทงาน --"
                isSearchable
                maxMenuHeight={200}
                formatOptionLabel={(data) => (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{data.label}</span>
                    {data.isCustom && (
                      <span
                        onClick={(e) => handleDeleteType(e, data.value)}
                        style={{
                          color: '#e53e3e',
                          cursor: 'pointer',
                          padding: '2px 8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          backgroundColor: '#fff5f5'
                        }}
                        title="ลบประเภทงานนี้"
                      >
                        ✕
                      </span>
                    )}
                  </div>
                )}
                styles={{
                  option: (provided, state) => ({
                    ...provided,
                    color: state.data.value === 'ADD_NEW_TYPE' ? '#4a90e2' : provided.color,
                    fontWeight: state.data.value === 'ADD_NEW_TYPE' ? 'bold' : provided.fontWeight,
                  })
                }}
              />
            </div>

            <div className="form-group">
              <label>ราคา</label>
              <input
                type="text"
                name="price"
                autoComplete="off"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>รายละเอียด</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>


            <div className="form-group">
              <label>วันครบกำหนด</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>


            <div className="form-group">
              <label>สถานะ</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">เลือกสถานะ</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                <option value="ยกเลิก">ยกเลิก</option>
              </select>
            </div>

            <button type="submit" className="btn-submit">
              บันทึก
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddSubWork;
