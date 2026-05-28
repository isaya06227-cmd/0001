import React, { useCallback, useState, useEffect } from 'react';
import Navbar from '../Component/Navbar_admin';
import '../Css/Table.css';
import feather from 'feather-icons';
import axios from 'axios';
import Swal from 'sweetalert2';

function ManageEmployees() {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '',
        full_name: '',
        gender: '',
        age: '',
        birth_date: '',
        citizen_id: '',
        phone_number: '',
        start_date: '',
        resign_date: '',
        years_of_service: 0,
        bank_account: '',
        current_salary: '',
        department: '',
        position: '',
        Google_drive: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const apiBase = import.meta.env.VITE_API_URL;

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await axios.get(`${apiBase}/api/employees`);
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
        }
    }, [apiBase]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        feather.replace();
    }, [employees]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        if (profileImage) {
            data.append('profile_image', profileImage);
        }

        try {
            if (isEditing) {
                await axios.put(`${apiBase}/api/employees/${editId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire({
                    icon: 'success',
                    title: 'แก้ไขข้อมูลสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                });
                setIsEditing(false);
                setEditId(null);
            } else {
                await axios.post(`${apiBase}/api/employees`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                Swal.fire({
                    icon: 'success',
                    title: 'เพิ่มพนักงานสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            resetForm();
            fetchEmployees();
        } catch (err) {
            Swal.fire('ผิดพลาด', err.response?.data?.message || 'ทำรายการไม่สำเร็จ', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            employee_id: '',
            full_name: '',
            gender: '',
            age: '',
            birth_date: '',
            citizen_id: '',
            phone_number: '',
            start_date: '',
            resign_date: '',
            years_of_service: 0,
            bank_account: '',
            current_salary: '',
            department: '',
            position: '',
            Google_drive: ''
        });
        setProfileImage(null);
        const fileInput = document.getElementById('profile_image_input');
        if (fileInput) fileInput.value = '';
        setIsEditing(false);
        setEditId(null);
    };

    const handleEdit = (emp) => {
        setFormData({
            employee_id: emp.employee_id,
            full_name: emp.full_name,
            gender: emp.gender || '',
            age: emp.age || '',
            birth_date: emp.birth_date ? emp.birth_date.split('T')[0] : '',
            citizen_id: emp.citizen_id || '',
            phone_number: emp.phone_number || '',
            start_date: emp.start_date ? emp.start_date.split('T')[0] : '',
            resign_date: emp.resign_date ? emp.resign_date.split('T')[0] : '',
            years_of_service: emp.years_of_service || 0,
            bank_account: emp.bank_account || '',
            current_salary: emp.current_salary || '',
            department: emp.department || '',
            position: emp.position || '',
            Google_drive: emp.Google_drive || ''
        });
        setIsEditing(true);
        setEditId(emp.employee_id);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "ข้อมูลพนักงานจะถูกลบถาวร!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4f',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${apiBase}/api/employees/${id}`);
                    Swal.fire('ลบสำเร็จ!', 'ข้อมูลพนักงานถูกลบแล้ว', 'success');
                    fetchEmployees();
                } catch (err) {
                    Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || 'ลบไม่สำเร็จ', 'error');
                }
            }
        });
    };

    return (
        <>
            <Navbar />
            <div className="content-wrapper">
                <div className="container-fluid">
                    <div className="row">
                        {/* Form Section */}
                        <div className="col-lg-4 mb-4">
                            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                                <div className="card-header bg-transparent border-0 pt-4 pb-0">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className={`p-2 rounded-3 ${isEditing ? 'bg-warning' : 'bg-primary'} text-white shadow-sm`}>
                                            <i data-feather={isEditing ? 'edit-3' : 'user-plus'} style={{ width: '24px', height: '24px' }}></i>
                                        </div>
                                        <h4 className="mb-0 fw-bold text-dark">{isEditing ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}</h4>
                                    </div>
                                    <hr className="mt-4 mb-0" />
                                </div>
                                <div className="card-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                    <form onSubmit={handleSubmit} className="user-form">
                                        <div className="mb-4 text-center">
                                            <label className="form-label d-block text-muted small fw-bold text-uppercase mb-2">รูปถ่ายพนักงาน</label>
                                            <div className="position-relative d-inline-block">
                                                <div className="bg-light rounded-pill p-1 cursor-pointer" onClick={() => document.getElementById('profile_image_input').click()}>
                                                    <img
                                                        src={profileImage ? URL.createObjectURL(profileImage) : 'https://via.placeholder.com/100'}
                                                        alt="Profile"
                                                        className="rounded-pill object-fit-cover shadow-sm"
                                                        style={{ width: '100px', height: '100px', border: '3px solid white' }}
                                                    />
                                                    <div className="position-absolute bottom-0 end-0 bg-white shadow-sm rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                        <i data-feather="camera" style={{ width: '16px', color: '#666' }}></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                className="d-none"
                                                id="profile_image_input"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">ชื่อ-ามสกุล <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="ระบุชื่อจริง-นามสกุล" />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">รหัสพนักงาน <span className="text-danger">*</span></label>
                                                    <input type="text" className="form-control" name="employee_id" value={formData.employee_id} onChange={handleChange} required placeholder="EMPxxxx" disabled={isEditing} />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">เลขบัตรประชาชน</label>
                                                    <input type="text" className="form-control" name="citizen_id" value={formData.citizen_id} onChange={handleChange} placeholder="1-xxxx-xxxxx-xx-x" />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">เพศ</label>
                                                    <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                                                        <option value="">เลือกเพศ</option>
                                                        <option value="ชาย">ชาย</option>
                                                        <option value="หญิง">หญิง</option>
                                                        <option value="อื่นๆ">อื่นๆ</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">อายุ</label>
                                                    <input type="number" className="form-control" name="age" value={formData.age} onChange={handleChange} placeholder="ปี" />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">วันเกิด</label>
                                                    <input type="date" className="form-control" name="birth_date" value={formData.birth_date} onChange={handleChange} />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">เบอร์โทรศัพท์</label>
                                                    <input type="text" className="form-control" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="08x-xxxxxxx" />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">แผนก/ฝ่าย</label>
                                                    <input type="text" className="form-control" name="department" value={formData.department} onChange={handleChange} placeholder="เช่น กราฟิก" />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">ตำแหน่ง</label>
                                                    <input type="text" className="form-control" name="position" value={formData.position} onChange={handleChange} placeholder="เช่น Graphic Designer" />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">วันที่เริ่มงาน</label>
                                                    <input type="date" className="form-control" name="start_date" value={formData.start_date} onChange={handleChange} />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">อายุการทำงาน (ปี)</label>
                                                    <input type="number" className="form-control" name="years_of_service" value={formData.years_of_service} onChange={handleChange} />
                                                </div>
                                            </div>

                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">เลขบัญชีธนาคาร</label>
                                                    <input type="text" className="form-control" name="bank_account" value={formData.bank_account} onChange={handleChange} placeholder="ระบุเลขบัญชี" />
                                                </div>
                                            </div>

                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">เงินเดือนปัจจุบัน</label>
                                                    <div className="input-group">
                                                        <input type="number" className="form-control" name="current_salary" value={formData.current_salary} onChange={handleChange} placeholder="0.00" />
                                                        <span className="input-group-text bg-light">฿</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-12">
                                                <div className="form-group mb-0">
                                                    <label className="fw-bold small mb-1">Google Drive Link</label>
                                                    <input type="text" className="form-control" name="Google_drive" value={formData.Google_drive} onChange={handleChange} placeholder="https://drive.google.com/..." />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2 mt-5">
                                            <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-success'} py-2 fw-bold shadow-sm`}>
                                                <i data-feather={isEditing ? 'save' : 'plus-circle'} className="me-2" style={{ width: '18px' }}></i>
                                                {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงานเข้าสู่ระบบ'}
                                            </button>
                                            {isEditing && (
                                                <button type="button" className="btn btn-light py-2 fw-bold border" onClick={resetForm}>
                                                    ยกเลิก
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="col-lg-8">
                            <div className="card shadow-lg border-0" style={{ borderRadius: '20px' }}>
                                <div className="card-header bg-transparent border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                                    <h4 className="mb-0 fw-bold text-dark">รายชื่อพนักงานทั้งหมด</h4>
                                    <div className="text-muted small">ทั้งหมด {employees.length} ท่าน</div>
                                </div>
                                <div className="card-body p-0 mt-3">
                                    <div className="table-responsive">
                                        <table className="styled-table mb-0">
                                            <thead>
                                                <tr>
                                                    <th>ลำดับ</th>
                                                    <th>ข้อมูลเบื้องต้น</th>
                                                    <th>แผนก/ตำแหน่ง</th>
                                                    <th>ติดต่อ</th>
                                                    <th className="text-center">จัดการ</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employees.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-5 text-muted">
                                                            <div className="p-4">
                                                                <i data-feather="users" style={{ width: '48px', height: '48px', opacity: 0.2 }}></i>
                                                                <p className="mt-2">ไม่พบข้อมูลพนักงานในระบบ</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    employees.map((emp, index) => (
                                                        <tr key={emp.employee_id} className="row-default">
                                                            <td className="text-center fw-bold text-muted">{index + 1}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-3">
                                                                    <img
                                                                        src={emp.profile_image || 'https://via.placeholder.com/50'}
                                                                        alt=""
                                                                        className="rounded-circle shadow-sm border"
                                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                                    />
                                                                    <div>
                                                                        <div className="fw-bold text-dark">{emp.full_name}</div>
                                                                        <small className="text-muted fw-bold">ID: {emp.employee_id}</small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="fw-600">{emp.department || '-'}</div>
                                                                <small className="text-muted bg-light px-2 rounded">{emp.position || '-'}</small>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2 small">
                                                                    <i data-feather="phone" style={{ width: '12px' }}></i> {emp.phone_number || '-'}
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                <div className="d-flex justify-content-center gap-2">
                                                                    <button className="btn btn-sm btn-outline-warning border-0 p-2 rounded-circle" onClick={() => handleEdit(emp)} title="แก้ไข">
                                                                        <i data-feather="edit-2" style={{ width: '18px' }}></i>
                                                                    </button>
                                                                    <button className="btn btn-sm btn-outline-danger border-0 p-2 rounded-circle" onClick={() => handleDelete(emp.employee_id)} title="ลบ">
                                                                        <i data-feather="trash-2" style={{ width: '18px' }}></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManageEmployees;
