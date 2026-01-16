import React, { useEffect, useState } from 'react';
import Navbar from '../Component/Navbar';
import axios from 'axios';
import '../Css/Profile.css';
import '../Css/Table.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios.get(`/api/profile/${username}`)
      .then(res => {
        setProfile(res.data);
      })
      .catch(err => console.error('Error fetching profile:', err))
      .finally(() => setLoading(false));
  }, [username]);

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
              <p>เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่ภายหลัง</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="content-wrapper">
        <div className="profile-wrapper">
          <div className="profile-container">
            <div className="profile-hero"></div>

            <div className="profile-header-main">
              <div className="profile-avatar-container">
                <img
                  src={profile.profile_image || 'https://via.placeholder.com/150'}
                  alt="รูปพนักงาน"
                  className="profile-avatar"
                />
              </div>
              <h1 className="profile-name">{profile.full_name}</h1>
              <div className="profile-title">{profile.position}</div>
              <span className="id-badge">ID: {profile.employee_id}</span>
            </div>

            <div className="profile-content-grid">
              <div className="profile-section">
                <div className="info-group">
                  <span className="info-label">ฝ่าย / แผนก</span>
                  <span className="info-value">{profile.department}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">เพศ</span>
                  <span className="info-value">{profile.gender}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">อายุ</span>
                  <span className="info-value">{profile.age} ปี</span>
                </div>
              </div>

              <div className="profile-section">
                <div className="info-group">
                  <span className="info-label">ข้อมูลเงินเดือนล่าสุด</span>
                  <div className="salary-container" style={{ marginTop: '0.5rem' }}>
                    <span className="salary-tag">
                      {Number(profile.current_salary).toLocaleString()} ฿
                    </span>
                  </div>
                </div>
                <div className="info-group">
                  <span className="info-label">Username</span>
                  <span className="info-value" style={{ borderLeftColor: '#764ba2' }}>@{username}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">สถานะพนักงาน</span>
                  <span className="info-value" style={{ color: '#38a169', borderLeftColor: '#38a169' }}>
                    กำลังปฏิบัติงาน
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
