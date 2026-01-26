import React, { useEffect, useState } from 'react';
import feather from 'feather-icons';
import '../Css/Navbar.css';

function Navbar() {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/');
  }

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };

  // ให้ Feather Icons แสดงทุกครั้งที่เปิดเมนูย่อย
  useEffect(() => {
    feather.replace();
  }, [showSubmenu]);

  useEffect(() => {
    // Check localStorage on mount
    const isCollapsed = localStorage.getItem('navbar-collapsed') === 'true';
    setCollapsed(isCollapsed);
    if (isCollapsed) {
      document.body.classList.add('nav-collapsed');
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('navbar-collapsed', newState);
    if (newState) {
      document.body.classList.add('nav-collapsed');
    } else {
      document.body.classList.remove('nav-collapsed');
    }
  };



  return (
    <>
      <button className="nav-toggle-btn" onClick={toggleSidebar}>
        <i data-feather={collapsed ? "menu" : "chevron-left"}></i>
      </button>

      <nav className={`navbar ${collapsed ? 'collapsed' : ''}`}>
        <div className="navbar-scroll">
          <ul className="navbar__menu">
            <li className="navbar__item">
              <a href="/Dashboard_A" className="navbar__link">
                <i data-feather="home"></i>
                <span>หน้าหลัก</span>
              </a>
            </li>
            <li className="navbar__item">
              <a href="/Admin" className="navbar__link">
                <i data-feather="calendar"></i>
                <span className='tooltip'>ตารางงานของทีม</span>
              </a>
            </li>
            <li className="navbar__item">
              <a href="/MyWork_A" className="navbar__link">
                <i data-feather="briefcase"></i>
                <span>งานของฉัน</span>
              </a>
            </li>
            <li className="navbar__item">
              <a href="/SubmitWork_A" className="navbar__link">
                <i data-feather="upload-cloud"></i>
                <span>ส่งงานตรวจสอบ</span>
              </a>
            </li>
            <li className="navbar__item">
              <a href="/Status_work_A" className="navbar__link">
                <i data-feather="check-circle"></i>
                <span>สถานะของงานที่ส่งตรวจ</span>
              </a>
            </li>
            {/* <li className="navbar__item">
            <a href="/Completed_work_A" className="navbar__link">
              <i data-feather="check-square"></i>
              <span>จำนวนงานที่เรียบร้อย</span>
            </a>
          </li>*/}
            <li className="navbar__item">
              <a href="/CheckWork" className="navbar__link">
                <i data-feather="search"></i>
                <span>ตรวจสอบงาน</span>
              </a>
            </li>

            {/* เพิ่มงาน (Dropdown) */}
            <li className="navbar__item has-submenu">
              <a href="#" className="navbar__link" onClick={toggleSubmenu}>
                <i data-feather="file-plus"></i>
                <span>เพิ่มงาน</span>
                <i data-feather="chevron-down" className="submenu-arrow"></i>
              </a>
              {showSubmenu && (
                <ul className="submenu">
                  <li className="navbar__item">
                    <a href="/AddCustomer" className="navbar__link">
                      <i data-feather="user-plus"></i>
                      <span>เพิ่มข้อมูลลูกค้า</span>
                    </a>
                  </li>

                  <li className="navbar__item">
                    <a href="/AddProject" className="navbar__link">
                      <i data-feather="folder-plus"></i>
                      <span>เพิ่มโปรเจกต์</span>
                    </a>
                  </li>

                  <li className="navbar__item">
                    <a href="/AddJob" className="navbar__link">
                      <i data-feather="plus-circle"></i>
                      <span>เพิ่มงานย่อย</span>
                    </a>
                  </li>
                  {/*<li  >
          <a href="/AddCustomer">
            <i data-feather="user-plus"></i>
            <span>เพิ่มข้อมูลลูกค้า</span>
          </a>
        </li>
        <li>
          <a href="/AddProject">
            <i data-feather="folder-plus"></i>
            <span>เพิ่มโปรเจกต์</span>
          </a>
        </li>
        <li>
          <a href="/AddJob">
            <i data-feather="plus-circle"></i>
            <span>เพิ่มงานย่อย</span>
          </a>
        </li>
        <li>
          <a href="/EditData">
            <i data-feather="edit"></i>
            <span>แก้ไขข้อมูล</span>
          </a>
        </li>*/}

                </ul>
              )}
            </li>
            <li className="navbar__item">
              <a href="/work_completed" className="navbar__link">
                <i data-feather="briefcase"></i>
                <span>งานที่ผ่านการตรวจสอบเเล้ว</span>
              </a>
            </li>

            <li className="navbar__item">
              <a href="/Profile_A" className="navbar__link">
                <i data-feather="user"></i>
                <span>ข้อมูลส่วนตัว</span>
              </a>
            </li>
            <li className="navbar__item">
              <a href="/ManageUsers" className="navbar__link">
                <i data-feather="users"></i>
                <span>จัดการข้อมูลผู้ใช้</span>
              </a>
            </li>
            <li className="navbar__item">
              <a href="/ManageEmployees" className="navbar__link">
                <i data-feather="users"></i>
                <span>จัดการข้อมูลพนักงาน</span>
              </a>
            </li>

            <li className="navbar__item logout" onClick={handleLogout}>
              <a href="#" className="navbar__link">
                <i data-feather="log-out"></i>
                <span>ออกจากระบบ</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
