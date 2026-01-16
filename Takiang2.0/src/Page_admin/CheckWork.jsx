import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';
import Swal from 'sweetalert2';

function CheckWorkAdmin() {
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);

  const [statusFilter, setStatusFilter] = useState('รอดําเนินการ');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    // กรองข้อมูลตามสถานะที่เลือก
    const filtered = works.filter(work => {
      if (statusFilter === 'ทั้งหมด') return true;
      return work.status === statusFilter;
    });
    setFilteredWorks(filtered);
    setCurrentPage(1); // กลับไปหน้าแรกทุกครั้งที่เปลี่ยน filter
  }, [works, statusFilter]);

  const fetchWorks = () => {
    axios.get('/api/submitted-works')
      .then(res => setWorks(res.data))
      .catch(err => console.error(err));
  };


  const handleApprove = (work) => {
    Swal.fire({
      title: 'ยืนยันผลการตรวจสอบ?',
      text: "คุณต้องการให้งานนี้ 'ผ่าน' ใช่หรือไม่?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ผ่าน',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await updateWorkStatus(work, 'ผ่าน', '-');
      }
    });
  };

  const handleReject = (work) => {
    Swal.fire({
      title: 'ไม่อนุมัติงาน',
      text: "กรุณาระบุเหตุผลที่ไม่ผ่าน:",
      input: 'textarea',
      inputPlaceholder: 'ระบุสิ่งที่ต้องแก้ไข...',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'ยืนยัน (ไม่ผ่าน)',
      cancelButtonText: 'ยกเลิก',
      preConfirm: (comment) => {
        if (!comment) {
          Swal.showValidationMessage('กรุณาระบุเหตุผล');
        }
        return comment;
      }
    }).then(async (res) => {
      if (res.isConfirmed) {
        await updateWorkStatus(work, 'ไม่ผ่าน', res.value);
      }
    });
  };

  const updateWorkStatus = async (work, status, comment) => {
    try {
      await axios.put('/api/submitted-works/update', {
        submitted_id: work.submitted_id,
        link: work.link,
        username: work.username,
        project_id: work.project_id,
        works_id: work.works_id,
        round_number: work.round_number,
        status: status,
        reviewer_comment: comment
      });
      fetchWorks();

      Swal.fire({
        icon: 'success',
        title: 'อัปเดตสถานะเรียบร้อย',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตสถานะได้',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ผ่าน': return '#d4edda';        // เขียวอ่อน
      case 'ไม่ผ่าน': return '#f8d7da';    // แดงอ่อน
      case 'รอดําเนินการ': return '#fff3cd'; // เหลืองอ่อน
      default: return 'transparent';
    }
  };

  // คำนวณข้อมูลหน้าปัจจุบัน (pagination)
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentWorks = filteredWorks.slice(indexOfFirst, indexOfLast);

  // เปลี่ยนหน้า
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredWorks.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card">
          <h3>ตรวจสอบและแก้ไขสถานะงาน</h3>

          <label>กรองสถานะ: </label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ marginBottom: '1rem', marginLeft: '0.5rem' }}
            className='select-custom'
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="รอดําเนินการ">รอดําเนินการ</option>
            <option value="ผ่าน">ผ่าน</option>
            <option value="ไม่ผ่าน">ไม่ผ่าน</option>
          </select>

          <table className="styled-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>ผู้ส่ง</th>
                <th>ชื่อโปรเจค</th>
                <th>ชื่องาน</th>
                <th>รอบ</th>
                <th>ลิงก์งาน</th>
                <th>วันที่ส่ง</th>
                <th>สถานะ</th>
                <th>คอมเมนต์ผู้ตรวจ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {currentWorks.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>ไม่มีข้อมูลงาน</td>
                </tr>
              ) : (
                currentWorks.map(work => (
                  <tr key={`${work.username}-${work.project_id}-${work.works_id}-${work.round_number}`}
                    style={{ backgroundColor: getStatusColor(work.status) }}>
                    <td>{work.username}</td>
                    <td>{work.project_name}</td>
                    <td>{work.works_name}</td>
                    <td>{work.round_number}</td>
                    <td><a href={work.link} target="_blank" rel="noreferrer">ลิงก์งาน</a></td>
                    <td>{new Date(work.submitted_date).toLocaleDateString('th-TH')}</td>
                    <td>{work.status}</td>
                    <td>{work.reviewer_comment || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleApprove(work)}
                        className='button-success'
                        style={{ marginRight: '5px', backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ผ่าน
                      </button>
                      <button
                        onClick={() => handleReject(work)}
                        className='button-danger'
                        style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ไม่ผ่าน
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button onClick={prevPage} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
            <span>หน้า {currentPage} / {Math.ceil(filteredWorks.length / rowsPerPage)}</span>
            <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredWorks.length / rowsPerPage)} className='BBB'>ถัดไป</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CheckWorkAdmin;
