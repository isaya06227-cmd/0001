
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Component/Navbar_admin';
import '../Css/Table.css';
import Swal from 'sweetalert2';
import feather from 'feather-icons';
import { useNavigate } from 'react-router-dom';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        feather.replace();
    }, [users]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/employees-with-users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            Swal.fire('Error', 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้', 'error');
        }
    };

    const handleDelete = (username) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: `ต้องการลบผู้ใช้ ${username} ใช่หรือไม่การกระทำนี้ไม่สามารถย้อนกลับได้`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/users/${username}`);
                    fetchUsers();
                    Swal.fire('สำเร็จ', 'ลบผู้ใช้เรียบร้อยแล้ว', 'success');
                } catch (e) {
                    console.error(e);
                    Swal.fire('Error', 'เกิดข้อผิดพลาดในการลบ (อาจมีงานค้าง)', 'error');
                }
            }
        });
    };

    const [editModal, setEditModal] = useState(false);
    const [editData, setEditData] = useState({ username: '', team: '', password: '', new_username: '', employee_id: '' });
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/api/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const handleEdit = (user) => {
        setEditData({
            username: user.username, // Old username for API identification
            new_username: user.username, // New username to edit
            employee_id: user.employee_id,
            team: user.team,
            password: ''
        });
        setEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`/api/users/${editData.username}`, editData);
            setEditModal(false);
            fetchUsers();
            Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
        } catch (err) {
            console.error('Update user error:', err);
            const msg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไข';
            Swal.fire('Error', msg, 'error');
        }
    };

    return (
        <>
            <Navbar />
            <div className="content-wrapper">
                <div className="card form-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>จัดการข้อมูลผู้ใช้งาน</h3>
                        <button className="btn-submit" onClick={() => navigate('/Add_user')}>
                            <i data-feather="user-plus" style={{ marginRight: '5px' }}></i> เพิ่มผู้ใช้งาน
                        </button>
                    </div>

                    <div className="table-wrapper">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>รหัสพนักงาน</th>
                                    <th>ชื่อผู้ใช้</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>ทีม</th>
                                    <th style={{ textAlign: 'center' }}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <tr key={index} className="row-default">
                                            <td>{user.employee_id}</td>
                                            <td>{user.username || '-'}</td>
                                            <td>{user.full_name}</td>
                                            <td>{user.team ? user.team.toUpperCase() : '-'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {user.username && (
                                                    <button className="button-ED" onClick={() => handleEdit(user)} style={{ marginRight: '5px' }}>
                                                        แก้ไข
                                                    </button>
                                                )}
                                                <button className="button-cancel" onClick={() => handleDelete(user.username)} style={{ marginLeft: 0 }}>
                                                    ลบ
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>ไม่พบข้อมูลผู้ใช้งาน</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Edit User */}
            {editModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <h3>แก้ไขข้อมูลผู้ใช้: {editData.username}</h3>

                        <div className="form-group">
                            <label>ชื่อผู้ใช้ (Username)</label>
                            <input
                                type="text"
                                value={editData.new_username}
                                onChange={(e) => setEditData({ ...editData, new_username: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>พนักงานที่ผูกบัญชี</label>
                            <select
                                value={editData.employee_id}
                                onChange={(e) => setEditData({ ...editData, employee_id: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            >
                                <option value="">-- เลือกพนักงาน --</option>
                                {employees.map(emp => (
                                    <option key={emp.employee_id} value={emp.employee_id}>
                                        {emp.employee_id} - {emp.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>ทีม</label>
                            <select
                                value={editData.team}
                                onChange={(e) => setEditData({ ...editData, team: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            >
                                <option value="admin">Admin</option>
                                <option value="graphics">Graphics</option>
                                <option value="marketing">Marketing</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>เปลี่ยนรหัสผ่าน (ถ้าไม่เปลี่ยนให้เว้นว่าง)</label>
                            <input
                                type="password"
                                value={editData.password}
                                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                placeholder="รหัสผ่านใหม่"
                                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div className="modal-actions" style={{ marginTop: '20px', justifyContent: 'flex-end', display: 'flex' }}>
                            <button className="button-save" onClick={handleSaveEdit}>บันทึก</button>
                            <button className="button-cancel" onClick={() => setEditModal(false)}>ยกเลิก</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ManageUsers;
