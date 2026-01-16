import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import feather from 'feather-icons';
import Select from 'react-select';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';

// ===== Helper: บังคับให้ค่ากลายเป็น Array เสมอ =====
const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const x = JSON.parse(val);
      return Array.isArray(x) ? x : (x && typeof x === 'object' ? Object.values(x) : []);
    } catch {
      return [];
    }
  }
  if (val && typeof val === 'object') return Object.values(val);
  return [];
};

// Work Types
const workTypeOptions = [
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
  { value: "วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่", label: "วัสดุพีวีซีสำหรับพิมพ์งานขนาดใหญ่" },
];

const teamOptions = [
  { value: 'admin', label: 'แอดมิน' },
  { value: 'graphics', label: 'กราฟิก' },
  { value: 'marketing', label: 'การตลาด' },
];

function Admin() {
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState('admin');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [works, setWorks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  // Edit Project Mode
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editProjectData, setEditProjectData] = useState({});

  // Edit Work Mode
  const [editWorkModal, setEditWorkModal] = useState(false);
  const [editWorkData, setEditWorkData] = useState({});
  const [teamEmployees, setTeamEmployees] = useState([]);

  const [allEmployees, setAllEmployees] = useState([]);

  // Fetch all employees once
  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get('/api/employees-with-users');
      setAllEmployees(res.data || []);
    } catch (error) {
      console.error('Error fetching all employees:', error);
    }
  };

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // ===== ใช้ relative path เพื่อให้ proxy ของ Vite ส่งไป Node server =====
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`/api/projects/team/${team}`);
      console.log('Projects fetched:', res.data);  // debug
      setProjects(toArray(res.data));
      setCurrentPage(1);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการโหลดโปรเจกต์:', error);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchAllEmployees();
  }, [team]);

  const handleTeamChange = (e) => setTeam(e.target.value);

  useEffect(() => {
    feather.replace();
  }, [works, showModal]);

  const handleRowClick = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      const res = await axios.get(`/api/works/project/${projectId}`);
      setWorks(toArray(res.data));
      setShowModal(true);
    } catch (error) {
      console.error('โหลด works ล้มเหลว:', error);
      setWorks([]);
      setShowModal(true);
    }
  };

  const handleDeleteWork = async (workId) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบงานนี้ใช่ไหม การกระทำนี้ไม่สามารถย้อนกลับได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/works/${workId}`);
        Swal.fire(
          'ลบสำเร็จ!',
          'งานถูกลบออกจากระบบแล้ว.',
          'success'
        );
        // Refresh works list
        if (selectedProjectId) {
          const res = await axios.get(`/api/works/project/${selectedProjectId}`);
          setWorks(toArray(res.data));
        }
      } catch (error) {
        console.error('Error deleting work:', error);
        Swal.fire(
          'เกิดข้อผิดพลาด!',
          'ไม่สามารถลบงานได้ กรุณาลองใหม่อีกครั้ง.',
          'error'
        );
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    const result = await Swal.fire({
      title: 'ลบโปรเจกต์?',
      text: "การลบโปรเจกต์จะลบงานย่อยทั้งหมดภายในด้วย! คุณแน่ใจหรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบทั้งหมด!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/projects/${projectId}`);
        Swal.fire(
          'ลบสำเร็จ!',
          'โปรเจกต์และงานย่อยถูกลบเรียบร้อยแล้ว.',
          'success'
        );
        fetchProjects(); // Refresh list
      } catch (error) {
        console.error('Error deleting project:', error);
        Swal.fire(
          'เกิดข้อผิดพลาด!',
          'ไม่สามารถลบโปรเจกต์ได้.',
          'error'
        );
      }
    }
  };

  const handleEditProject = async (projectId) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}`);
      const data = res.data;
      if (data.due_date) {
        // Format date safely
        const dateObj = new Date(data.due_date);
        const dateOnly = dateObj.toISOString().split('T')[0];
        setEditProjectData({ ...data, due_date: dateOnly });
      } else {
        setEditProjectData(data);
      }
      setEditProjectModal(true);
    } catch (error) {
      console.error('Error fetching project for edit:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลโปรเจกต์ได้', 'error');
    }
  };

  const handleSaveProject = async () => {
    try {
      // Prepare payload to update only editable fields
      const payload = {
        project_name: editProjectData.project_name,
        price: editProjectData.price ? String(editProjectData.price).replace(/,/g, '') : 0,
        responsible_team: editProjectData.responsible_team,
        due_date: editProjectData.due_date,
        status: editProjectData.status
      };

      await axios.put(`/api/projects/${editProjectData.project_id}`, payload);
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
      setEditProjectModal(false);
      fetchProjects(); // Refresh list
    } catch (error) {
      console.error('Error updating project:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'บันทึกไม่สำเร็จ', 'error');
    }
  };

  const handleEditWork = async (workId) => {
    try {
      // 1. Fetch work details
      const workRes = await axios.get(`/api/works/${workId}`);
      const data = workRes.data;

      // Adjust date format
      if (data.due_date) {
        const dateObj = new Date(data.due_date);
        const dateOnly = dateObj.toISOString().split('T')[0];
        data.due_date = dateOnly;
      }
      setEditWorkData(data);

      // 2. Fetch project details to get responsible_team
      const projectRes = await axios.get(`/api/projects/${data.project_id}`);
      const projectData = projectRes.data;
      const projectTeams = projectData.responsible_team ? projectData.responsible_team.split(',') : [];

      // 3. Filter employees based on project teams
      const filtered = allEmployees.filter(emp => projectTeams.includes(emp.team));
      setTeamEmployees(filtered);

      setEditWorkModal(true);
    } catch (error) {
      console.error('Error fetching work/project/employees:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลงานได้', 'error');
    }
  };

  const handleSaveWork = async () => {
    try {
      await axios.put(`/api/works/${editWorkData.work_id}`, editWorkData);
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });
      setEditWorkModal(false);

      // Refresh works list
      if (selectedProjectId) {
        const res = await axios.get(`/api/works/project/${selectedProjectId}`);
        setWorks(toArray(res.data));
      }
    } catch (error) {
      console.error('Error updating work:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'บันทึกไม่สำเร็จ', 'error');
    }
  };

  const handleEmployeeClick = async (username) => {
    try {
      const res = await axios.get(`/api/employees/${username}`);
      setEmployeeData(res.data || null);
      setShowEmployeeModal(true);
    } catch (error) {
      console.error('โหลดข้อมูลพนักงานล้มเหลว:', error);
      setEmployeeData(null);
      setShowEmployeeModal(true);
    }
  };


  const teamNames = {
    admin: 'แอดมิน',
    graphics: 'กราฟิก',
    marketing: 'การตลาด',
  };
  // ===== Pagination (ปลอดภัยด้วย toArray) =====
  const safeProjects = toArray(projects);
  const totalPages = Math.max(1, Math.ceil(safeProjects.length / rowsPerPage));
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentProjects = safeProjects.slice(indexOfFirst, indexOfLast);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage((p) => p + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage((p) => p - 1); };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="team-select" style={{ fontWeight: '600', marginRight: '10px' }}>
              เลือกทีม:{' '}
            </label>
            <select
              id="team-select"
              value={team}
              onChange={handleTeamChange}
              className="select-custom"
            >
              <option value="admin">แอดมิน</option>
              <option value="graphics">กราฟิก</option>
              <option value="marketing">การตลาด</option>
            </select>
          </div>

          <p style={{ fontSize: '20px' }}>โปรเจกต์ที่รับผิดชอบโดยทีม: {teamNames[team]}</p>

          {currentProjects.length === 0 ? (
            <p>ยังไม่มีโปรเจกต์</p>
          ) : (
            <>
              <table style={{ marginTop: '1rem' }} className="styled-table">
                <thead>
                  <tr>
                    <th>รหัสโปรเจกต์</th>
                    <th>ชื่อโปรเจกต์</th>
                    <th>ชื่อลูกค้า</th>
                    <th>ราคา (บาท)</th>
                    <th>ทีมที่รับผิดชอบ</th>
                    <th>สถานะ</th>
                    <th>กำหนดส่ง</th>
                    <th style={{ textAlign: 'center' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project) => {
                    const priceNum = Number(project?.price ?? 0);
                    const dueDateText = project?.due_date
                      ? new Date(project.due_date).toLocaleDateString('th-TH')
                      : '-';
                    const rowClass =
                      project?.status === 'เสร็จสิ้น'
                        ? 'row-complete'
                        : project?.status === 'กำลังดำเนินการ'
                          ? 'row-in-progress'
                          : 'row-default';

                    return (
                      <tr
                        key={project?.project_id ?? `${project?.project_name}-${project?.customer_name}`}
                        className={rowClass}
                        onClick={() => project?.project_id && handleRowClick(project.project_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{project?.project_id ?? '-'}</td>
                        <td>{project?.project_name ?? '-'}</td>
                        <td>{project?.customer_name ?? '-'}</td>
                        <td>{isNaN(priceNum) ? '-' : priceNum.toLocaleString()}</td>
                        <td>{project?.responsible_team ?? '-'}</td>
                        <td>{project?.status ?? '-'}</td>
                        <td>{dueDateText}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project.project_id);
                            }}
                            style={{
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '14px',
                              marginRight: '8px'
                            }}
                            title="แก้ไขโปรเจกต์"
                          >
                            <i data-feather="edit" style={{ width: '16px', height: '16px' }}></i>
                            <span>แก้ไข</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.project_id);
                            }}
                            style={{
                              backgroundColor: '#ff4d4f',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '14px'
                            }}
                            title="ลบโปรเจกต์"
                          >
                            <i data-feather="trash-2" style={{ width: '16px', height: '16px' }}></i>
                            <span>ลบ</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="pagination-wrapper">
                <button onClick={prevPage} disabled={currentPage === 1} className="BBB">ก่อนหน้า</button>
                <span className="page-indicator">หน้า {currentPage} จาก {totalPages}</span>
                <button onClick={nextPage} disabled={currentPage === totalPages || totalPages === 0} className="BBB">ถัดไป</button>
              </div>
            </>
          )}

          {/* Modal งานย่อย */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex' }}>
                  <button onClick={() => setShowModal(false)} className="off">
                    <p style={{ fontSize: '20px' }}>x</p>
                  </button>
                </div>
                <h3>รายการงานย่อยของโปรเจกต์ {selectedProjectId ?? '-'}</h3>
                <br />
                {toArray(works).length === 0 ? (
                  <p>ไม่พบงานย่อย</p>
                ) : (
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>รหัสงาน</th>
                        <th>ชื่องาน</th>
                        <th>ประเภทงาน</th>
                        <th>ราคา</th>
                        <th>รายละเอียด</th>
                        <th>ผู้รับผิดชอบ</th>
                        <th>กำหนดส่ง</th>
                        <th>สถานะ</th>
                        <th style={{ textAlign: 'center' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {toArray(works).map((work) => {
                        const workRowClass =
                          work?.status === 'เสร็จสิ้น'
                            ? 'row-complete'
                            : work?.status === 'กำลังดำเนินการ'
                              ? 'row-in-progress'
                              : work?.status === 'รอดำเนินการ'
                                ? 'row-pending'
                                : work?.status === 'ยกเลิก'
                                  ? 'row-cancelled'
                                  : '';

                        const workDue = work?.due_date
                          ? new Date(work.due_date).toLocaleDateString('th-TH')
                          : '-';

                        return (
                          <tr key={work?.work_id ?? `${work?.works_name}-${work?.assigned_to}`} className={workRowClass}>
                            <td>{work?.work_id ?? '-'}</td>
                            <td>{work?.works_name ?? '-'}</td>
                            <td>{work?.work_type ?? '-'}</td>
                            <td>{work?.price ?? '-'}</td>
                            <td>{work?.description ?? '-'}</td>
                            <td
                              onClick={(e) => {
                                e.stopPropagation();
                                if (work?.assigned_to) handleEmployeeClick(work.assigned_to);
                              }}
                              style={{ cursor: work?.assigned_to ? 'pointer' : 'default', color: 'black', textDecoration: work?.assigned_to ? 'underline' : 'none' }}
                              title={work?.assigned_to ? 'คลิกดูข้อมูลพนักงาน' : ''}
                            >
                              {work?.assigned_to ?? '-'}
                            </td>
                            <td>{workDue}</td>
                            <td>{work?.status ?? '-'}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditWork(work.work_id);
                                }}
                                style={{
                                  backgroundColor: '#f59e0b',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  padding: '5px 10px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  marginRight: '5px'
                                }}
                              >
                                <i data-feather="edit" style={{ width: '16px', height: '16px' }}></i>
                                <span>แก้ไข</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWork(work.work_id);
                                }}
                                style={{
                                  backgroundColor: '#ff4d4f',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  padding: '5px 10px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}
                              >
                                <i data-feather="trash-2" style={{ width: '16px', height: '16px' }}></i>
                                <span>ลบ</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Modal ข้อมูลพนักงาน */}
          {showEmployeeModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex' }}>
                  <button onClick={() => setShowEmployeeModal(false)} className="off">
                    <p style={{ fontSize: '20px' }}>x</p>
                  </button>
                </div>
                <h3>ข้อมูลพนักงานที่ผูกไว้</h3>
                {employeeData ? (
                  <div style={{ marginTop: '10px' }}>
                    <p><strong>ชื่อ:</strong> {employeeData?.full_name ?? '-'}</p>
                    <p><strong>แผนก:</strong> {employeeData?.department ?? '-'}</p>
                    <p><strong>ตำแหน่ง:</strong> {employeeData?.position ?? '-'}</p>
                  </div>
                ) : (
                  <p style={{ marginTop: '10px' }}>ไม่พบข้อมูลพนักงาน</p>
                )}
              </div>
            </div>
          )}

          {/* Modal แก้ไขโปรเจกต์ */}
          {editProjectModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex' }}>
                  <button onClick={() => setEditProjectModal(false)} className="off">
                    <p style={{ fontSize: '20px' }}>x</p>
                  </button>
                </div>
                <h3>แก้ไขข้อมูลโปรเจกต์</h3>

                <div className="user-form">
                  <div className="form-group">
                    <label>ชื่อโปรเจกต์</label>
                    <input
                      type="text"
                      value={editProjectData.project_name || ''}
                      onChange={(e) => setEditProjectData({ ...editProjectData, project_name: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>ราคา</label>
                    <input
                      type="text"
                      value={editProjectData.price || ''}
                      onChange={(e) => setEditProjectData({ ...editProjectData, price: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>ทีมที่รับผิดชอบ (เลือกได้หลายทีม)</label>
                    <Select
                      isMulti
                      options={teamOptions}
                      value={
                        editProjectData.responsible_team
                          ? editProjectData.responsible_team.split(',').map(t => {
                            const val = t.trim();
                            return teamOptions.find(opt => opt.value === val) || { value: val, label: val };
                          })
                          : []
                      }
                      onChange={(selected) => {
                        const joined = selected ? selected.map(s => s.value).join(',') : '';
                        setEditProjectData({ ...editProjectData, responsible_team: joined });
                      }}
                      placeholder="-- เลือกทีม --"
                    />
                  </div>
                  <div className="form-group">
                    <label>วันครบกำหนด</label>
                    <input
                      type="date"
                      value={editProjectData.due_date || ''}
                      onChange={(e) => setEditProjectData({ ...editProjectData, due_date: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>สถานะ</label>
                    <select
                      value={editProjectData.status || ''}
                      onChange={(e) => setEditProjectData({ ...editProjectData, status: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    >
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                      <option value="ยกเลิก">ยกเลิก</option>
                    </select>
                  </div>

                  <div className="modal-buttons" style={{ marginTop: '20px' }}>
                    <button onClick={handleSaveProject} style={{ backgroundColor: '#28a745', color: 'white' }}>บันทึก</button>
                    <button onClick={() => setEditProjectModal(false)}>ยกเลิก</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal แก้ไขงานย่อย */}
          {editWorkModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex' }}>
                  <button onClick={() => setEditWorkModal(false)} className="off">
                    <p style={{ fontSize: '20px' }}>x</p>
                  </button>
                </div>
                <h3>แก้ไขข้อมูลงานย่อย</h3>

                <div className="user-form">
                  <div className="form-group">
                    <label>ชื่อโปรเจกต์ (แก้ไขไม่ได้)</label>
                    <input
                      type="text"
                      value={editWorkData.works_name || ''}
                      onChange={(e) => setEditWorkData({ ...editWorkData, works_name: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                      placeholder="ชื่องาน"
                    />
                  </div>

                  <div className="form-group">
                    <label>ประเภทงาน</label>
                    <Select
                      options={workTypeOptions}
                      value={workTypeOptions.find(opt => opt.value === editWorkData.work_type) || null}
                      onChange={(selected) =>
                        setEditWorkData(prev => ({ ...prev, work_type: selected?.value || '' }))
                      }
                      placeholder="-- เลือกประเภทงาน --"
                      isSearchable
                      maxMenuHeight={200}
                    />
                  </div>

                  <div className="form-group">
                    <label>ราคา</label>
                    <input
                      type="text"
                      value={editWorkData.price || ''}
                      onChange={(e) => setEditWorkData({ ...editWorkData, price: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>รายละเอียด</label>
                    <textarea
                      value={editWorkData.description || ''}
                      onChange={(e) => setEditWorkData({ ...editWorkData, description: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px', minHeight: '80px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>ผู้รับผิดชอบ (เฉพาะทีม {teamNames[team] || team})</label>
                    <select
                      value={editWorkData.assigned_to || ''}
                      onChange={(e) => setEditWorkData({ ...editWorkData, assigned_to: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    >
                      <option value="">-- เลือกผู้รับผิดชอบ --</option>
                      {teamEmployees.map((emp) => (
                        <option key={emp.employee_id} value={emp.username}>
                          {emp.full_name} ({emp.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>วันครบกำหนด</label>
                    <input
                      type="date"
                      value={editWorkData.due_date || ''}
                      onChange={(e) => setEditWorkData({ ...editWorkData, due_date: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>สถานะ</label>
                    <select
                      value={editWorkData.status || ''}
                      onChange={(e) => setEditWorkData({ ...editWorkData, status: e.target.value })}
                      style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    >
                      <option value="รอดำเนินการ">รอดำเนินการ</option>
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                      <option value="ยกเลิก">ยกเลิก</option>
                    </select>
                  </div>

                  <div className="modal-buttons" style={{ marginTop: '20px' }}>
                    <button onClick={handleSaveWork} style={{ backgroundColor: '#28a745', color: 'white' }}>บันทึก</button>
                    <button onClick={() => setEditWorkModal(false)}>ยกเลิก</button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default Admin;
