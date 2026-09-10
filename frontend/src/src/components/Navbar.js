import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';

function Navbar() {
        const handleButtonClick = () => {};
        const [version,] = useState("1.8.1")
        const email = sessionStorage.getItem('Email') || '';
        const username = email.split('@')[0];
        const [showDropdown, setShowDropdown] = useState(false);
        const dropdownRef = useRef(null);
      
        const [showModal, setShowModal] = useState(false);
      
        const handleOpenModal = () => {
          setShowModal(true);
        };
      
        const handleCloseModal = () => {
          setShowModal(false);
        };

        const handleLogout = async () => {
          window.location.href = "/Logout"
        };
    
        useEffect(() => {
          const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
              setShowDropdown(false);
            }
          };
          document.addEventListener('mousedown', handleClickOutside);
          return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

  return (
    <div>
         <nav className="navbar navbar-dark shadow justify-content-between px-3 py-2" style={{ background: 'linear-gradient(90deg, #0d6efd 0%, #0b5ed7 100%)', borderBottom: 'none' }}>
          <a className="navbar-brand fw-bold text-white" href="/" style={{ marginLeft: '1rem', display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}>Grader</span>
            <span className="text-light ms-2 fw-normal" style={{ fontSize: "0.75rem", opacity: 0.8 }}>{version}</span>
          </a>
          <form className="form-inline d-flex align-items-center">
            <Link to="/">
              <button onClick={handleButtonClick} className="btn btn-outline-light fw-semibold" type="button" style={{ borderRadius: '8px', borderWidth: '1px' }}>
                Home
              </button>
            </Link>
            <span style={{ margin: '0 8px' }}></span>
            <div style={{ position: 'relative', display: 'inline-block', marginRight: '1rem' }} ref={dropdownRef}>
              <button type="button" className="btn btn-light text-primary dropdown-toggle fw-bold" onClick={() => setShowDropdown(!showDropdown)} style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                {username || 'User'}
              </button>
              {showDropdown && (
                <div className="dropdown-menu show shadow-sm" style={{ position: 'absolute', right: 0, left: 'auto', marginTop: '0.5rem', borderRadius: '8px', border: 'none', padding: '0.5rem' }}>
                  <button className="dropdown-item rounded text-danger fw-semibold" type="button" onClick={() => { setShowDropdown(false); handleOpenModal(); }}>
                    <i className="bi bi-box-arrow-right me-2"></i>Log out
                  </button>
                </div>
              )}
            </div>
          </form>
        </nav>

        {/* Modal */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Logout</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              Do you want to logout?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default Navbar