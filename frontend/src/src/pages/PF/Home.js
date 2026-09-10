import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`

function HomePF() {
  const navigate = useNavigate();

  const [Email,] = useState(Cookies.get('Email'));
  const [courses, setCourses] = useState(null);
  const [classes, setClasses] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(null);
  const [expandedYear, setExpandedYear] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [formData, setFormData] = useState({
    Creator: '',
    ClassName: '',
    ClassID: '',
    SchoolYear: ''
  });

  const fetchCourses = useCallback(async () => {
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
      var sortedCourses = Object.fromEntries(Object.entries(data).sort((a, b) => b[0].localeCompare(a[0])));
      
      setCourses(sortedCourses);
      if(Object.keys(sortedCourses).length > 0) setExpandedYear(Object.keys(sortedCourses)[0])

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
      sortedCourses = Object.fromEntries(Object.entries(classData).sort((a, b) => b[0].localeCompare(a[0])));
      setClasses(sortedCourses);

    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  }, [])
  
  

  useEffect(() => {
    fetchCourses();
    setReady(true);
  }, [ready, fetchCourses]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
    setFormData({
      Creator: Email,
      ClassName: '',
      ClassID: '',
      SchoolYear: ''
    });
  };

  const handleCancel = () => {
    setFormData({
      Creator:'',
      ClassName: '',
      ClassID: '',
      SchoolYear: ''
    });
    setExpanded(false);
  };
  
  const handleCreateClick = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${host}/TA/class/create`, {
        method: 'POST',
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        },
        body: JSON.stringify(formData)
      });
      const responseData = await response.json();
      if (responseData.Status) {
        fetchCourses();
        handleCancel()
        withReactContent(Swal).fire({
            title: "Class created",
            icon: "success"
        })
      }else{
        withReactContent(Swal).fire({
          title: "Error!",
          icon: "error"
        })
      }
    } catch (error) {
      withReactContent(Swal).fire({
        title: "Please contact admin!",
        text: error,
        icon: "error"
      })
    }
  };

  return (
    <div>
      <style>{`
        .custom-hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15) !important;
        }
      `}</style>
      <Navbar />
      <br />
      <div className="d-flex align-items-center">
        <h5 className="me-2" style={{marginLeft:'10px'}}>Course</h5>
        {!expanded ? (<button  onClick={handleToggleExpand} className="btn btn-outline-secondary" type="button" id="button-addon2">+ New</button>) : null }
      </div>
      {!expanded ? (null) : ( 
          <div className="container d-flex justify-content-center">
            <div className="card" style={{ width: '800px' }}>
              <div className="card-header">
                <h4>Create Class</h4>
              </div>
              <div className="card-body">
                <form className="row g-3">
                  <div className="col-md-3">
                    <label htmlFor="inputID" className="form-label">Class ID</label>
                    <input type="text" name="ClassID" className="form-control" id="inputID" placeholder="e.g., 2301240"  onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="inputYear" className="form-label">Academic year/Semester</label>
                    <input type="text" name="SchoolYear" className="form-control" id="inputYear" placeholder="e.g., 2021/2" onChange={handleChange} />
                  </div>
                  <div className="col-6">
                    <label htmlFor="inputName" className="form-label">Class Name</label>
                    <input type="text" name="ClassName" className="form-control" id="inputClass" placeholder="e.g., Introduction to Computer Science" onChange={handleChange} />
                  </div>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="button" className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                    <div>
                      <button type="button" className="btn btn-primary" onClick={handleCreateClick}>Create</button>
                      <br />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          )}


      {courses && ready ? (
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
                    <div className="card custom-hover-card" style={{width: '300px', marginLeft: "10px", marginRight: "10px", cursor: 'pointer', overflow: 'hidden', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s ease'}} key={course.ClassID}
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
                                    sessionStorage.setItem("Thumbnail", course.Thumbnail);
                                    sessionStorage.setItem("classId", course.ID);
                                    sessionStorage.setItem("ClassID", course.ClassID);
                                    sessionStorage.setItem("SchoolYear", expandedYear);
                                    sessionStorage.setItem("ClassName", course.ClassName);
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
      ) : (
        "")}
        
      {(classes && Object.keys(classes).length > 0) && ready ? (
          <div>
            {courses && Object.keys(courses).length > 0 && (
              <div className="container-lg">
                <hr className="my-4" style={{ borderTop: '2px solid #dee2e6' }} />
              </div>
            )}
            <br></br>
            <div className="container-lg mb-3" style={{ padding: '10px' }}>
              {(!courses || Object.keys(courses).length === 0) && (
                <select className="form-select" style={{ width: '200px', marginBottom: '10px' }} value={expandedYear || ''} onChange={(e) => setExpandedYear(e.target.value)}>
                  {Object.keys(classes).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
              {expandedYear && classes[expandedYear] ? (
                <div className="mb-4">
                  <h6 className="text-muted mb-3" style={{ paddingLeft: '10px', color: 'gray' }}>Student view (Year {expandedYear})</h6>
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
                </div>
              ) : (
                <div className="mb-4">
                  <h6 className="text-muted mb-3" style={{ paddingLeft: '10px', color: 'gray' }}>Student view - No classes for Year {expandedYear}</h6>
                </div>
              )}
            </div>
          </div>
      ) : (null)}
    </div>
  )
}

export default HomePF
