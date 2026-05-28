import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Css/Table.css';
import Navbar from '../Component/Navbar_admin';
import Swal from 'sweetalert2'

function AddCustomer() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    gender: '',
    phone: '',
    other_contact: '',
    tax_id: '',
    billing_address: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    axios.get('/api/customers')
      .then(response => {
        setCustomers(response.data);
        setCurrentPage(1); // reset page when data loads
      })
      .catch(error => {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า:', error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`/api/customers/${editId}`, formData);
        Swal.fire({
          title: 'แก้ไขข้อมูลสำเร็จ!',
          text: 'ข้อมูลลูกค้าถูกอัปเดตแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
      } else {
        await axios.post('/api/customers', formData);
        Swal.fire({
          title: 'เพิ่มลูกค้าเรียบร้อย!',
          text: 'ข้อมูลลูกค้าใหม่ถูกบันทึกแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        });
      }
      fetchCustomers();
      closeModal();
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: isEditing ? 'ไม่สามารถแก้ไขข้อมูลลูกค้าได้' : 'ไม่สามารถเพิ่มข้อมูลลูกค้าได้',
        icon: 'error',
        confirmButtonText: 'ปิด'
      });
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      customer_name: customer.customer_name,
      gender: customer.gender,
      phone: customer.phone,
      other_contact: customer.other_contact || '',
      tax_id: customer.tax_id || '',
      billing_address: customer.billing_address || '',
      email: customer.email || ''
    });
    setEditId(customer.customer_id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณจะไม่สามารถย้อนกลับการลบนี้ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/customers/${id}`);
          Swal.fire(
            'ลบเรียบร้อย!',
            'ข้อมูลลูกค้าถูกลบออกจากระบบแล้ว',
            'success'
          );
          fetchCustomers();
        } catch (error) {
          console.error('ลบไม่สำเร็จ:', error);
          Swal.fire(
            'เกิดข้อผิดพลาด!',
            'ไม่สามารถลบข้อมูลลูกค้าได้',
            'error'
          );
        }
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({
      customer_name: '',
      gender: '',
      phone: '',
      other_contact: '',
      tax_id: '',
      billing_address: '',
      email: ''
    });
  };

  // คำนวณขอบเขตข้อมูลที่จะแสดงในแต่ละหน้า
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentCustomers = customers.slice(indexOfFirst, indexOfLast);

  // ฟังก์ชันเปลี่ยนหน้า
  const nextPage = () => {
    if (currentPage < Math.ceil(customers.length / rowsPerPage)) {
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
          <div className="container">
            <h3>รายชื่อลูกค้า</h3>
            <button className="btn-add" onClick={() => { setIsEditing(false); setShowModal(true); }}> เพิ่มข้อมูลลูกค้า</button>

            <table className="styled-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ชื่อลูกค้า</th>
                  <th>เพศ</th>
                  <th>เบอร์โทร</th>
                  <th>ช่องทางติดต่ออื่นๆ</th>
                  <th>เลขประจำตัวผู้เสียภาษี</th>
                  <th>ที่อยู่ออกใบกำกับภาษี</th>
                  <th>อีเมล</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(currentCustomers) && currentCustomers.length > 0 ? (
                  currentCustomers.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td>{customer.customer_id}</td>
                      <td>{customer.customer_name}</td>
                      <td>{customer.gender}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.other_contact}</td>
                      <td>{customer.tax_id}</td>
                      <td>{customer.billing_address}</td>
                      <td>{customer.email}</td>
                      <td>
                        <button className="btn-edit" style={{ marginRight: '5px', backgroundColor: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleEdit(customer)}>แก้ไข</button>
                        <button className="btn-delete" style={{ backgroundColor: '#dc3545', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleDelete(customer.customer_id)}>ลบ</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center' }}>ไม่มีข้อมูลลูกค้า</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ปุ่ม Pagination */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={prevPage} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
              <span>หน้า {currentPage} / {Math.ceil(customers.length / rowsPerPage)}</span>
              <button onClick={nextPage} disabled={currentPage === Math.ceil(customers.length / rowsPerPage)} className='BBB'>ถัดไป</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal เพิ่มลูกค้า */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}</h2>
            <form onSubmit={handleSubmit}>
              <label>ชื่อลูกค้า</label>
              <input
                type="text"
                name="customer_name"
                placeholder="ชื่อลูกค้า"
                autoComplete="off"
                value={formData.customer_name}
                onChange={handleInputChange}
                required
              />
              <label>เพศ</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">เลือกเพศ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              <label>เบอร์โทร</label>
              <input
                type="text"
                name="phone"
                autoComplete="off"
                placeholder="เบอร์โทร"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              <label>ช่องทางติดต่ออื่นๆ</label>
              <input
                type="text"
                name="other_contact"
                autoComplete="off"
                placeholder="ช่องทางติดต่ออื่นๆ"
                value={formData.other_contact}
                onChange={handleInputChange}
              />
              <label>เลขประจำตัวผู้เสียภาษี</label>
              <input
                type="text"
                name="tax_id"
                autoComplete="off"
                placeholder="เลขประจำตัวผู้เสียภาษี"
                value={formData.tax_id}
                onChange={handleInputChange}
              />
              <label>ที่อยู่ออกใบกำกับภาษี</label>
              <textarea
                name="billing_address"
                autoComplete="off"
                placeholder="ที่อยู่ออกใบกำกับภาษี"
                value={formData.billing_address}
                onChange={handleInputChange}
              />
              <label>อีเมล</label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                placeholder="อีเมล"
                value={formData.email}
                onChange={handleInputChange}
              />
              <div className="modal-actions">
                <button type="submit" className='button-save'>บันทึก</button>
                <button type="button" onClick={closeModal} className='button-cancel'>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddCustomer;