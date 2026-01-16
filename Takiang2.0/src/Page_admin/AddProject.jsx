import React, { useState, useEffect } from 'react';
import axios from 'axios';
import feather from 'feather-icons';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';
import Swal from 'sweetalert2';

function AddProject() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    project_name: '',
    customer_id: '',
    price: '',
    responsible_team: 'graphics', // default
    status: 'กำลังดำเนินการ', // default
    due_date: ''
  });

  useEffect(() => {
    feather.replace();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('โหลดข้อมูลลูกค้าล้มเหลว:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', formData);

      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มโปรเจกต์เรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง'
      });

      setFormData({
        project_name: '',
        customer_id: '',
        price: '',
        responsible_team: 'graphics',
        status: 'กำลังดำเนินการ',
        due_date: ''
      });
    } catch (err) {
      console.error('เพิ่มโปรเจกต์ล้มเหลว:', err);

      let errorMessage = 'เกิดข้อผิดพลาด';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      Swal.fire({
        title: 'ผิดพลาด!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'ปิด'
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="card form-card">
          <div className="form-header">
            <i data-feather="folder-plus"></i>
            <h2>เพิ่มโปรเจกต์</h2>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label>ชื่อโปรเจกต์</label>
              <input
                type="text"
                name="project_name"
                autoComplete="off"
                value={formData.project_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>ชื่อลูกค้า</label>
              <input
                list="customerList"
                autoComplete="off"
                name="customer_name"
                value={formData.customer_name || ''}
                onChange={(e) => {
                  const name = e.target.value;
                  const selected = customers.find(cust => cust.customer_name === name);
                  setFormData((prev) => ({
                    ...prev,
                    customer_name: name,
                    customer_id: selected ? selected.customer_id : ''
                  }));
                }}
                placeholder="พิมพ์ชื่อลูกค้า"
                required
              />
              <datalist id="customerList">
                {customers.map((cust) => (
                  <option
                    key={cust.customer_id}
                    value={cust.customer_name}
                  />
                ))}
              </datalist>
            </div>



            <div className="form-group">
              <label>ราคา</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>ทีมที่รับผิดชอบ</label>
              <div className="team-checkbox-group" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    value="graphics"
                    checked={formData.responsible_team.split(',').includes('graphics')}
                    onChange={(e) => {
                      const teams = formData.responsible_team ? formData.responsible_team.split(',') : [];
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, responsible_team: [...teams, 'graphics'].filter(Boolean).join(',') }));
                      } else {
                        setFormData(prev => ({ ...prev, responsible_team: teams.filter(t => t !== 'graphics').join(',') }));
                      }
                    }}
                  />
                  Graphics
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    value="marketing"
                    checked={formData.responsible_team.split(',').includes('marketing')}
                    onChange={(e) => {
                      const teams = formData.responsible_team ? formData.responsible_team.split(',') : [];
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, responsible_team: [...teams, 'marketing'].filter(Boolean).join(',') }));
                      } else {
                        setFormData(prev => ({ ...prev, responsible_team: teams.filter(t => t !== 'marketing').join(',') }));
                      }
                    }}
                  />
                  Marketing
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    value="admin"
                    checked={formData.responsible_team.split(',').includes('admin')}
                    onChange={(e) => {
                      const teams = formData.responsible_team ? formData.responsible_team.split(',') : [];
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, responsible_team: [...teams, 'admin'].filter(Boolean).join(',') }));
                      } else {
                        setFormData(prev => ({ ...prev, responsible_team: teams.filter(t => t !== 'admin').join(',') }));
                      }
                    }}
                  />
                  Admin
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>สถานะ</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="เสร็จสิ้น">เสร็จสิ้น</option>
              </select>
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

            <button type="submit" className="btn-submit">
              บันทึก
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddProject;
