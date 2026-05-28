import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Component/Navbar';
import '../Css/Table.css';

function MyWorkTable() {
  const [works, setWorks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const rowsPerPage = 10;

  const fetchWorks = async () => {
    const username = localStorage.getItem('username');
    if (!username) return;

    try {
      setLoading(true);
      const res = await axios.get(`/api/my-works/${username}`);
      console.log('Fetched works:', res.data);
      setWorks(res.data);
    } catch (err) {
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  // คำนวณ index สำหรับ slice
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentWorks = works.slice(indexOfFirst, indexOfLast);

  // ฟังก์ชันเปลี่ยนหน้า
  const nextPage = () => {
    if (currentPage < Math.ceil(works.length / rowsPerPage)) {
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '20px', margin: 0 }}>งานของฉัน</p>
            <button onClick={fetchWorks} className="BBB">
              🔄 รีเฟรช
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>กำลังโหลด...</p>
          ) : (
            <>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ชื่อโปรเจกต์</th>
                    <th>ชื่องาน</th>
                    <th>ประเภทงาน</th>
                    <th>ราคา</th>
                    <th>รายละเอียด</th>
                    <th>วันครบกำหนด</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWorks.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center' }}>ไม่พบงานที่รับผิดชอบ</td>
                    </tr>
                  ) : (
                    currentWorks.map((work) => (
                      <tr
                        key={work.work_id}
                        className={
                          work.status === 'เสร็จสิ้น' || work.status === 'ผ่าน'
                            ? 'row-complete'
                            : work.status === 'กำลังดำเนินการ'
                              ? 'row-in-progress'
                              : work.status === 'รอดำเนินการ'
                                ? 'row-pending'
                                : work.status === 'ยกเลิก'
                                  ? 'row-cancelled'
                                  : ''
                        }
                      >
                        <td>{work.project_name}</td>
                        <td>{work.works_name}</td>
                        <td>{work.work_type || '-'}</td>
                        <td>{work.price || '-'}</td>
                        <td>{work.description || '-'}</td>
                        <td>{work.due_date ? new Date(work.due_date).toLocaleDateString('th-TH') : '-'}</td>
                        <td>{work.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={prevPage} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
                <span>หน้า {currentPage} / {Math.ceil(works.length / rowsPerPage)}</span>
                <button onClick={nextPage} disabled={currentPage === Math.ceil(works.length / rowsPerPage)} className='BBB'>ถัดไป</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default MyWorkTable;
