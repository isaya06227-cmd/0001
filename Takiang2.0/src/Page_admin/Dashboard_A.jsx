import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Component/Navbar_admin';
import '../Css/Table.css'; // Reusing existing CSS
import feather from 'feather-icons';

function Dashboard_A() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalRevenue: 0,
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [works, setWorks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 5;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        feather.replace();
    });

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get('/api/projects/all');
            const projects = Array.isArray(res.data) ? res.data : [];

            const total = projects.length;
            const active = projects.filter(p => p.status === 'กำลังดำเนินการ').length;
            const completed = projects.filter(p => p.status === 'เสร็จสิ้น').length;
            const revenue = projects.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

            setStats({
                totalProjects: total,
                activeProjects: active,
                completedProjects: completed,
                totalRevenue: revenue,
            });

            setRecentProjects(projects);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
            setLoading(false);
        }
    };

    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = recentProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(recentProjects.length / projectsPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

    const handleRowClick = async (projectId) => {
        setSelectedProjectId(projectId);
        try {
            const res = await axios.get(`/api/works/project/${projectId}`);
            setWorks(Array.isArray(res.data) ? res.data : []);
            setShowModal(true);
        } catch (error) {
            console.error('โหลด works ล้มเหลว:', error);
            setWorks([]);
            setShowModal(true);
        }
    };

    return (
        <>
            <Navbar />
            <div className="content-wrapper" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

                <h2 style={{ marginBottom: '20px', color: '#333' }}>Dashboard ภาพรวม</h2>

                {/* Stats Cards Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>

                    <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>โปรเจกต์ทั้งหมด</p>
                                <h3 style={{ margin: '5px 0', fontSize: '28px' }}>{stats.totalProjects}</h3>
                            </div>
                            <i data-feather="folder" style={{ width: '40px', height: '40px', opacity: 0.5 }}></i>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>กำลังดำเนินการ</p>
                                <h3 style={{ margin: '5px 0', fontSize: '28px' }}>{stats.activeProjects}</h3>
                            </div>
                            <i data-feather="loader" style={{ width: '40px', height: '40px', opacity: 0.5 }}></i>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', color: '#2b5876' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>เสร็จสิ้น</p>
                                <h3 style={{ margin: '5px 0', fontSize: '28px' }}>{stats.completedProjects}</h3>
                            </div>
                            <i data-feather="check-circle" style={{ width: '40px', height: '40px', opacity: 0.5 }}></i>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>รายได้รวม (บาท)</p>
                                <h3 style={{ margin: '5px 0', fontSize: '28px' }}>{stats.totalRevenue.toLocaleString()}</h3>
                            </div>
                            <i data-feather="dollar-sign" style={{ width: '40px', height: '40px', opacity: 0.5 }}></i>
                        </div>
                    </div>

                </div>

                {/* Recent Projects Table */}
                <div className="card">
                    <h3 style={{ marginBottom: '15px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>โปรเจกต์ล่าสุด</h3>
                    {recentProjects.length === 0 ? (
                        <p style={{ color: '#888' }}>ไม่พบข้อมูลโปรเจกต์</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="styled-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อโปรเจกต์</th>
                                        <th>ลูกค้า</th>
                                        <th>ราคา</th>
                                        <th>สถานะ</th>
                                        <th>กำหนดส่ง</th>
                                        <th>ทีม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentProjects.map((p, idx) => (
                                        <tr
                                            key={idx}
                                            className={p.status === 'เสร็จสิ้น' ? 'row-complete' : (p.status === 'กำลังดำเนินการ' ? 'row-in-progress' : 'row-default')}
                                            onClick={() => handleRowClick(p.project_id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>{p.project_name}</td>
                                            <td>{p.customer_name}</td>
                                            <td>{(Number(p.price) || 0).toLocaleString()} บาท</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    backgroundColor: p.status === 'เสร็จสิ้น' ? '#28a745' : '#ffc107',
                                                    color: p.status === 'เสร็จสิ้น' ? 'white' : '#333',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td>{p.due_date ? new Date(p.due_date).toLocaleDateString('th-TH') : '-'}</td>
                                            <td>{p.responsible_team}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* ส่วนควบคุมการเปลี่ยนหน้า */}
                            <div className="pagination-wrapper">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="BBB"
                                >
                                    ก่อนหน้า
                                </button>

                                <span className="page-indicator">
                                    หน้า {currentPage} จาก {totalPages || 1}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="BBB"
                                >
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal งานย่อย */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowModal(false)} className="off">
                                    <p style={{ fontSize: '20px', margin: 0 }}>x</p>
                                </button>
                            </div>
                            <h3>รายการงานย่อยของโปรเจกต์ {selectedProjectId ?? '-'}</h3>
                            <br />
                            {works.length === 0 ? (
                                <p>ไม่พบงานย่อย</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="styled-table">
                                        <thead>
                                            <tr>
                                                <th>รหัสงาน</th>
                                                <th>ชื่องาน</th>
                                                <th>ราคา</th>
                                                <th>ประเภทงาน</th>
                                                <th>ผู้รับผิดชอบ</th>
                                                <th>กำหนดส่ง</th>
                                                <th>สถานะ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {works.map((work, idx) => {
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

                                                return (
                                                    <tr key={idx} className={workRowClass}>
                                                        <td>{work?.work_id ?? '-'}</td>
                                                        <td>{work?.works_name ?? '-'}</td>
                                                        <td>{(Number(work?.price) || 0).toLocaleString()} บาท</td>
                                                        <td>{work?.work_type ?? '-'}</td>
                                                        <td>{work?.assigned_to ?? '-'}</td>
                                                        <td>{work?.due_date ? new Date(work.due_date).toLocaleDateString('th-TH') : '-'}</td>
                                                        <td>{work?.status ?? '-'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

export default Dashboard_A;
