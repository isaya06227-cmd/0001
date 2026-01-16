import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import '../Css/Login.css'
import { useNavigate } from 'react-router-dom'

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        employee_id: '',
        team: 'graphics',
    })
    const [employees, setEmployees] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
            const res = await axios.get(`${baseURL}/api/employees`)
            setEmployees(res.data)
        } catch (err) {
            console.error('โหลดรายชื่อพนักงานล้มเหลว:', err)
        }
    }

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData({
            ...formData,
            [id]: id === 'team' ? value.toLowerCase() : value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.username || !formData.password || !formData.employee_id || !formData.team) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณากรอกข้อมูลให้ครบ',
                confirmButtonText: 'ตกลง',
            })
            return
        }

        try {
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
            const res = await axios.post(`${baseURL}/api/register`, formData)

            Swal.fire({
                icon: 'success',
                title: res.data.message || 'สมัครสมาชิกสำเร็จ',
                confirmButtonText: 'ตกลง',
            }).then(() => {
                navigate('/')
            })
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'สมัครสมาชิกไม่สำเร็จ',
                text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
                confirmButtonText: 'ลองอีกครั้ง',
            })
        }
    }

    return (
        <div>
            <div className="background">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            <form onSubmit={handleSubmit} className='form1' style={{ height: 'auto', minHeight: '520px', paddingBottom: '30px' }}>
                <h3>Register</h3>

                <label htmlFor="employee_id" className='label1'>Employee</label>
                <select
                    className='input1'
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.07)', color: '#fff' }}
                >
                    <option value="" style={{ color: '#000' }}>-- เลือกพนักงาน --</option>
                    {employees.map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id} style={{ color: '#000' }}>
                            {emp.full_name}
                        </option>
                    ))}
                </select>

                <label htmlFor="username" className='label1'>Username</label>
                <input className='input1'
                    type="text"
                    placeholder="Username"
                    id="username"
                    autoComplete="off"
                    value={formData.username}
                    onChange={handleChange}
                />

                <label htmlFor="password" className='label1'>Password</label>
                <input className='input1'
                    type="password"
                    placeholder="Password"
                    id="password"
                    autoComplete="off"
                    value={formData.password}
                    onChange={handleChange}
                />

                <label htmlFor="team" className='label1'>Team</label>
                <select
                    className='input1'
                    id="team"
                    value={formData.team}
                    onChange={handleChange}
                    required
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.07)', color: '#fff' }}
                >
                    <option value="graphics" style={{ color: '#000' }}>Graphics</option>
                    <option value="marketing" style={{ color: '#000' }}>Marketing</option>
                    <option value="admin" style={{ color: '#000' }}>Admin</option>
                </select>

                <button type="submit" className='button1'>Register</button>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#fff', fontSize: '14px' }}>
                        มีบัญชีอยู่แล้ว? <span
                            onClick={() => navigate('/')}
                            style={{ color: '#60f7ae', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            เข้าสู่ระบบ
                        </span>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default Register
