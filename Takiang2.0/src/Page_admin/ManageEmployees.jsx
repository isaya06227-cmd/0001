
import React, { useEffect } from 'react';
import Navbar from '../Component/Navbar_admin';
import '../Css/Table.css';
import feather from 'feather-icons';

function ManageEmployees() {

    useEffect(() => {
        feather.replace();
    }, []);

    return (
        <>
            <Navbar />
            <div className="content-wrapper">
                <div className="card form-card" style={{ height: '85vh', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>จัดการข้อมูลพนักงาน</h3>
                        <a href="https://employee01.onrender.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <i data-feather="external-link" style={{ width: '16px', height: '16px' }}></i> เปิดในหน้าต่างใหม่
                        </a>
                    </div>
                    <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                        <iframe
                            src="https://employee01.onrender.com/"
                            title="Employee Management System"
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                display: 'block'
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManageEmployees;
