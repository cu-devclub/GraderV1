import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar.js';
import { useNavigate } from 'react-router-dom';
import { Gear, ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`


function HomeST() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState(null);
  const [classes, setClasses] = useState(null);
  const [expandedYear, setExpandedYear] = useState();
  const [ready, setReady] = useState(null);

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
  
  const toggleYear = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  return (
    
    <main>
      <div>
        <Navbar userData={userData}/>
        <br />
      </div>
      {(courses && ready) ? (
        Object.keys(courses).length !== 0 ? (
        <main>
          <div>
            <br></br>
            <div className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
              <div className="row row-cols-1 row-cols-md-5 g-2">
                {Object.entries(courses).map(([year, classes]) => (
                  classes.map(course => (
                    <div
                      className="card"
                      style={{
                        width: "200px",
                        marginLeft: "10px",
                        marginRight: "10px",
                        border: "1px solid #ccc", // border stays solid
                        borderRadius: "8px",
                        overflow: "hidden"
                      }}
                      key={course.ClassID}
                    >
                      {/* Inner wrapper with opacity */}
                      <div style={{ opacity: course.Archive ? 0.3 : 1 }}>
                        <img
                          className="card-img-top w-100 d-block"
                          src={
                            course.Thumbnail
                              ? `${host}/Thumbnail/` + course.Thumbnail
                              : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"
                          }
                          style={{
                            width: "190px",
                            height: "190px",
                            paddingTop: "5px",
                            borderRadius: "5px"
                          }}
                          alt="..."
                        />
                        <div className="card-body">
                          <h4 className="card-title">{course.ClassName}</h4>
                          <p
                            style={{
                              fontSize: "1rem",
                              color: "rgb(96, 96, 96)",
                              display: course.Archive ? "block" : "none"
                            }}
                          >
                            {" (Archived)"}
                          </p>
                          <div className="card-text">
                            <div className="row">
                              <div className="col">{course.ClassID}</div>
                              <div className="col">{year}</div>
                            </div>
                          </div>
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => {
                              sessionStorage.setItem("classId", course.ID);
                              sessionStorage.setItem("Email", Email);
                              navigate("/AssignList");
                            }}
                          >
                            View course
                          </button>
                          <button
                            className="btn btn-warning float-end"
                            type="button"
                            onClick={() => {
                              sessionStorage.setItem("classId", course.ID);
                              sessionStorage.setItem("Archive", course.Archive);
                              navigate("/ClassEdit");
                            }}
                          >
                            <Gear />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (null)) : (null)}

      {(classes && Object.keys(classes).length > 0) && ready ? (
          <div>
            <br></br>
            {/* วนลูปเพื่อแสดง container แยกตามปีการศึกษา */}
            {Object.entries(classes).map(([year, classes], i) => (
              <div key={year} className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
                <h5 className='unselectable' onClick={() => toggleYear(year)} style={{ cursor: 'pointer' }}>
                  {expandedYear === year ? <ChevronDown /> : <ChevronRight />} {year}
                </h5>

                {expandedYear === year && (
                  <div className="row row-cols-1 row-cols-md-5 g-2">
                    {/* วนลูปเพื่อแสดงข้อมูลคอร์สในแต่ละปีการศึกษา */}
                    {classes.map((course) => (
                      <div className="card" style={{width: '200px', marginLeft: "10px", marginRight: "10px"}} key={course.ClassID}>
                        <img className="card-img-top w-100 d-block" src={course.Thumbnail ? `${host}/Thumbnail/` + course.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} style={{ width: '190px', height: '190px', paddingTop: '5px', borderRadius: '5px'}}  alt="..."/>
                        <div className="card-body">
                          <h4 className="card-title">{course.ClassName}</h4>
                          <p className="card-text">ID: {course.ClassID}</p>
                          <button className="btn btn-primary" type="button" onClick={() => {sessionStorage.setItem("classId", course.ID);  sessionStorage.setItem("Email", Email);  navigate("/Class");}}>
                            View course
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
      ) : (
        <div className="container-lg mb-3 bg-light" style={{ padding: '10px' }}>
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
