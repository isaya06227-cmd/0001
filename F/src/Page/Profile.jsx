import React, { useEffect, useState } from 'react';
import Navbar from '../Component/Navbar';
import axios from 'axios';
import '../Css/Profile.css';
import '../Css/Table.css';
import feather from 'feather-icons';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios.get(`${apiBase}/api/profile/${username}`)
      .then(res => {
        setProfile(res.data);
      })
      .catch(err => console.error('Error fetching profile:', err))
      .finally(() => setLoading(false));
  }, [username, apiBase]);

  useEffect(() => {
    feather.replace();
  }, [profile]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="content-wrapper">
          <div className="profile-wrapper">
            <div className="profile-container" style={{ padding: '4rem', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem', color: '#4a5568', fontWeight: 'bold' }}>กำลังโหลดข้อมูลพนักงาน...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="content-wrapper">
          <div className="profile-wrapper">
            <div className="profile-container" style={{ padding: '4rem', textAlign: 'center' }}>
              <h2 style={{ color: '#e53e3e' }}>ไม่พบข้อมูลโปรไฟล์</h2>
              <p>เกิดข้อผิดพลาดในการดึงข้อมูล พนักงานอาจจะยังไม่ได้ผูกกับรหัสผู้ใช้</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="profile-wrapper">
          <div className="profile-container pb-5">
            <div className="profile-hero"></div>

            <div className="profile-header-main">
              <div className="profile-avatar-container">
                <img
                  src={profile.profile_image || 'https://via.placeholder.com/150'}
                  alt="รูปพนักงาน"
                  className="profile-avatar border border-4 border-white shadow"
                />
              </div>
              <h1 className="profile-name">{profile.full_name}</h1>
              <div className="profile-title d-flex align-items-center justify-content-center gap-2">
                <i data-feather="briefcase" style={{ width: '18px' }}></i> {profile.position || 'ไม่มีตำแหน่ง'}
              </div>
              <div className="mt-2">
                <span className="badge bg-primary px-3 py-2">ID: {profile.employee_id}</span>
              </div>
            </div>

            <div className="profile-content-grid mt-4">
              <div className="profile-section card shadow-sm border-0 p-4">
                <h5 className="border-bottom pb-2 mb-3"><i data-feather="user" className="me-2"></i>ข้อมูลส่วนตัว</h5>
                <div className="info-group mb-3">
                  <span className="info-label text-muted">เลขบัตรประชาชน</span>
                  <span className="info-value d-block fw-bold">{profile.citizen_id || '-'}</span>
                </div>
                <div className="row">
                  <div className="col-6 info-group mb-3">
                    <span className="info-label text-muted">เพศ</span>
                    <span className="info-value d-block fw-bold">{profile.gender || '-'}</span>
                  </div>
                  <div className="col-6 info-group mb-3">
                    <span className="info-label text-muted">อายุ</span>
                    <span className="info-value d-block fw-bold">{profile.age ? `${profile.age} ปี` : '-'}</span>
                  </div>
                </div>
                <div className="info-group mb-3">
                  <span className="info-label text-muted">วันเกิด</span>
                  <span className="info-value d-block fw-bold">{formatDate(profile.birth_date)}</span>
                </div>
                <div className="info-group mb-3">
                  <span className="info-label text-muted">เบอร์โทรศัพท์</span>
                  <span className="info-value d-block fw-bold text-primary">{profile.phone_number || '-'}</span>
                </div>
              </div>

              <div className="profile-section card shadow-sm border-0 p-4">
                <h5 className="border-bottom pb-2 mb-3"><i data-feather="activity" className="me-2"></i>ข้อมูลการทำงาน</h5>
                <div className="info-group mb-3">
                  <span className="info-label text-muted">ฝ่าย / แผนก</span>
                  <span className="info-value d-block fw-bold">{profile.department || '-'}</span>
                </div>
                <div className="row">
                  <div className="col-6 info-group mb-3">
                    <span className="info-label text-muted">วันที่เริ่มงาน</span>
                    <span className="info-value d-block fw-bold">{formatDate(profile.start_date)}</span>
                  </div>
                  <div className="col-6 info-group mb-3">
                    <span className="info-label text-muted">อายุงาน</span>
                    <span className="info-value d-block fw-bold">{profile.years_of_service || 0} ปี</span>
                  </div>
                </div>
                <div className="info-group mb-3">
                  <span className="info-label text-muted">เลขบัญชีธนาคาร</span>
                  <span className="info-value d-block fw-bold">{profile.bank_account || '-'}</span>
                </div>
                <div className="info-group mb-3">
                  <span className="info-label text-muted">เงินเดือนปัจจุบัน</span>
                  <span className="info-value d-block fw-bold text-success" style={{ fontSize: '1.2rem' }}>
                    {profile.current_salary ? Number(profile.current_salary).toLocaleString() : '0'} ฿
                  </span>
                </div>
                {profile.Google_drive && (
                  <div className="mt-3">
                    <a href={profile.Google_drive} target="_blank" rel="noreferrer" className="btn btn-outline-danger w-100">
                      <i data-feather="link" className="me-2"></i> Google Drive
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-muted"><small>Username: @{username}</small></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
