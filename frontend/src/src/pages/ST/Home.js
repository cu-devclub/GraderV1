import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../../components/Navbar.js';
import { useNavigate } from 'react-router-dom';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`


function HomeST() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState(null);
  const [classes, setClasses] = useState(null);
  const [expandedYear, setExpandedYear] = useState();
  const [ready, setReady] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const [Email,] = useState(Cookies.get('Email'));

  useEffect(() => {
    setUserData({ID: Cookies.get("uid")})

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`${host}/ST/user/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const userData = await userResponse.json();
        setUserData(userData);
  
        // Fetch class data if user data is available
        if (userData) {
          const classResponse = await fetch(`${host}/ST/class/classes`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            }
          });
          const classData = await classResponse.json();
          const sortedCourses = Object.fromEntries(Object.entries(classData).sort((a, b) => b[0].localeCompare(a[0])));
          setClasses(sortedCourses);
          if(Object.keys(sortedCourses).length > 0) setExpandedYear(Object.keys(sortedCourses)[0])
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch(`${host}/TA/class/classes`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        const sortedCourses = Object.fromEntries(Object.entries(data).sort((a, b) => b[0].localeCompare(a[0])));
        setCourses(sortedCourses);
      } catch (error) {
        console.error('Error fetching class data:', error);
      }
    };

    fetchData()
    fetchCourses()
    setReady(true);
  }, [Email]);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    
    <main>
      <style>{`
        .custom-hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
        }
      `}</style>
      <div>
        <Navbar userData={userData}/>
        <br />
      </div>
      {(courses && ready) ? (
        Object.keys(courses).length !== 0 ? (
        <main>
          <div>
            <br></br>
            <div className="container-lg mb-3" style={{ padding: '10px' }}>
              <select className="form-select" style={{ width: '200px', marginBottom: '10px' }} value={expandedYear || ''} onChange={(e) => setExpandedYear(e.target.value)}>
                {Object.keys(courses).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {expandedYear && courses[expandedYear] && (
                <div className="row row-cols-1 row-cols-md-5 g-2">
                  {courses[expandedYear].map(course => (
                    <div className="card custom-hover-card" style={{width: '300px', marginLeft: "10px", marginRight: "10px", cursor: 'pointer', overflow: 'hidden', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', opacity: course.Archive ? 0.3 : 1}} key={course.ClassID}
                      onClick={() => {sessionStorage.setItem("classId", course.ID); sessionStorage.setItem("Email", Email); navigate("/AssignList");}}
                    >
                      <div style={{ width: '100%', height: '190px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                        <img className="card-img-top w-100 d-block" src={course.Thumbnail ? `${host}/Thumbnail/` + course.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} style={{ width: '100%', height: '100%', objectFit: 'contain', borderTopLeftRadius: '12px', borderTopRightRadius: '12px'}} alt="..."/>
                      </div>
                      <div className="card-body" style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h5 className="card-title fw-bold text-dark" style={{ marginBottom: '8px', flex: 1, minWidth: 0 }}>
                            {course.ClassName}
                            {course.Archive && <span className="badge bg-secondary ms-2 align-text-top" style={{fontSize: '0.7rem', fontWeight: '500'}}>Archived</span>}
                          </h5>
                          <div style={{ position: 'relative' }} ref={openMenuId === course.ID ? menuRef : null}>
                            <button
                              className="btn btn-link p-0 text-muted hover-dark"
                              type="button"
                              style={{ fontSize: '1.2rem', textDecoration: 'none' }}
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === course.ID ? null : course.ID); }}
                            >
                              <ThreeDotsVertical />
                            </button>
                            {openMenuId === course.ID && (
                              <div style={{
                                position: 'absolute', right: 0, top: '100%', zIndex: 10,
                                background: 'white', border: '1px solid #e9ecef', borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: '140px', padding: '4px 0'
                              }}>
                                <button
                                  className="dropdown-item"
                                  style={{ padding: '8px 16px', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    sessionStorage.setItem("classId", course.ID);
                                    sessionStorage.setItem("Archive", course.Archive);
                                    navigate("/ClassEdit");
                                  }}
                                >
                                  Edit course
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="card-text text-muted" style={{ marginBottom: '0', marginTop: 'auto', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-hash me-1"></i>{course.ClassID}
                          <span className="badge bg-light text-secondary border ms-auto px-2 py-1" style={{ fontWeight: '500' }}>{expandedYear}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (null)) : (null)}

      {(classes && Object.keys(classes).length > 0) && ready ? (
          <div>
            <br></br>
            <div className="container-lg mb-3" style={{ padding: '10px' }}>
              <select className="form-select" style={{ width: '200px', marginBottom: '10px' }} value={expandedYear || ''} onChange={(e) => setExpandedYear(e.target.value)}>
                {Object.keys(classes).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {expandedYear && classes[expandedYear] && (
                <div className="row row-cols-1 row-cols-md-5 g-2">
                  {classes[expandedYear].map((course) => (
                    <div className="card custom-hover-card" style={{width: '300px', marginLeft: "10px", marginRight: "10px", cursor: 'pointer', overflow: 'hidden', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s ease'}} key={course.ClassID}
                      onClick={() => {sessionStorage.setItem("classId", course.ID); sessionStorage.setItem("Email", Email); navigate("/Class");}}
                    >
                      <div style={{ width: '100%', height: '190px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                        <img className="card-img-top w-100 d-block" src={course.Thumbnail ? `${host}/Thumbnail/` + course.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} style={{ width: '100%', height: '100%', objectFit: 'contain', borderTopLeftRadius: '12px', borderTopRightRadius: '12px'}} alt="..."/>
                      </div>
                      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px' }}>
                        <h5 className="card-title fw-bold text-dark" style={{ marginBottom: '8px' }}>{course.ClassName}</h5>
                        <p className="card-text text-muted" style={{ marginBottom: '0', marginTop: 'auto', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                          <i className="bi bi-hash me-1"></i>{course.ClassID}
                          <span className="badge bg-light text-secondary border ms-auto px-2 py-1" style={{ fontWeight: '500' }}>{expandedYear}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      ) : (
        <div className="container-lg mb-3" style={{ padding: '10px' }}>
          <div className='align-items-left' style={{width:'100%'}}>
            <h5 className="text-start"style={{ cursor: 'pointer' }}>
              There is no class
            </h5>
          </div>
        </div>
      )}
    </main>
  );
}

export default HomeST;
