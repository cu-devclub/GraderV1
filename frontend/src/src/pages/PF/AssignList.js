import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { QrCodeScan } from 'react-bootstrap-icons';

const host = `${process.env.REACT_APP_HOST}`

function AssignList() {
  
  const navigate = useNavigate();
  const [ClassInfo, setClassInfo] = useState({});
  
  const [classId,] = useState(sessionStorage.getItem("classId"));

  const [assignmentsData, setAssignmentsData] = useState([]);
  
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "#FFF"
    if(!classId){
      navigate("/")
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${host}/TA/class/Assign?CSYID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        setAssignmentsData(data.data.Assignment);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchClass = async () => {
      try {
        const response = await fetch(`${host}/TA/class/class?CSYID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        setClassInfo(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchClass();
    fetchData()
  }, [classId, navigate]);

  const toggleLock = async (event, LID) => {
    fetch(`${process.env.REACT_APP_HOST}/TA/class/Assign/Lock`, {
      method: 'POST',
      credentials: "include",
      headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "X-CSRF-TOKEN": Cookies.get("csrf_token")
      },
      body: JSON.stringify({ LID: LID})
    })
    .then(response => response.json())
    .then(data => {
      withReactContent(Swal).fire({
        title: data.msg,
        icon: data.success ? "success" : "error"
      }).then(ok => {
        if(ok)
            window.location.reload()
      });
    })
    setIsButtonClicked(false);
  }

  const handleRedirect = async (LID) => {
    if (!isButtonClicked) {
      sessionStorage.setItem("LID", LID);
      navigate("/AssignEdit");
    }
  }

  return (
    <div>
      <Navbar />

      <br></br>
      {ClassInfo && (
      <div className='row' style={{width: "100vw"}}>
        <div className='col'>
          <div className="media d-flex align-items-center">
            <span style={{ margin: '0 10px' }}></span>
            <img className="mr-3" alt="thumbnail" src={ClassInfo['Thumbnail'] ? `${host}/Thumbnail/` + ClassInfo['Thumbnail'] : "https://cdn-icons-png.flaticon.com/512/3426/3426653.png"} style={{ width: '40px', height: '40px' }} />
            <span style={{ margin: '0 10px' }}></span>
            <div className="card" style={{ width: 'auto', padding: '10px' }}>
              <h5>{ClassInfo['ClassID']} {ClassInfo['ClassName']} {ClassInfo['ClassYear']}</h5>
              <h6>Instructor: {ClassInfo['Instructor']}</h6>
            </div>
          </div>
        </div>
        <div className='col-3' style={{padding: "0"}}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate("/Scan")}><QrCodeScan /> Scan</button>
        </div>
      </div>
      )}

      <br></br>
      {/* <div className="card" style={{ marginLeft: 10 + 'em', marginRight: 10 + 'em' }}> */}
      <div className="card" style={{ marginLeft: 10 + 'vw', marginRight: 10 + 'vw' }}>
        <div className="card-header">
          <div className="row" style={{marginBottom:"-5px"}}>
            <div className="col">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button className="nav-link active">Assignments</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link link" onClick={() => navigate("/StudentList")} >Student List</button>
                </li>
                {/* <button style={{marginLeft: "1.5rem"}} className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => navigate("/AssignCreate")} >+ New</button> */}
              </ul>
            </div>
            <div className="col-md">
              <button className="btn btn-primary float-end" type="button" style={{marginLeft:"20px"}} onClick={() => navigate("/")}>Back</button>
            </div>
          </div>
        </div>
        <div className="card-body" style={{ overflowY: 'scroll' }}>
          <button style={{marginLeft: "1.5rem", marginBottom: "1rem"}} className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={() => navigate("/AssignCreate")} >+ New</button>
          <div>
            {assignmentsData && ((assignmentsData.length !== 0) && (
              assignmentsData.map(assign => {
                return (
                <div key={assign["LID"]} className='card' style={{ marginBottom: '0.5rem' }} onClick={() => handleRedirect(assign["LID"])}>
                  <button style={{ fontSize: '1.2rem', height:'4rem'}} className="fw-bold ">
                    <div className='row'>
                      <div className='col-2' style={{textAlign: 'Left'}}>
                        <span style={{marginLeft: '2rem'}}>{`Lab ${assign["Lab"]}`}</span>
                      </div>
                      <div className='col' style={{textAlign: 'Left'}}>
                        <span>{`${assign["Name"]}`}</span>
                      </div>
                      <div className='col-3'>
                      <span style={{fontWeight:'normal', fontSize: '0.9rem'}}>
                          {`Publish:`}
                        </span>
                        <span style={{fontWeight:'normal'}}>
                          {` ${assign["Publish"]}`}
                        </span>
                      </div>
                      <div className='col-3'>
                        <span style={{fontWeight:'normal', fontSize: '0.9rem'}}>
                          {`Due:`}
                        </span>
                        <span style={{fontWeight:'normal'}}>
                          {` ${assign["Due"]}`}
                        </span>
                      </div>
                      <div className='col'>
                      <div className="d-flex">
                          <p style={{fontWeight:'normal'}}>Closed</p>
                          <div className="form-check form-switch form-check-inline">
                            <input className="form-check-input float-end" type="checkbox" role="switch" checked={!assign["Lock"]} onFocus={() => setIsButtonClicked(true)} onBlur={() => setIsButtonClicked(false)} onChange={(event) => toggleLock(event, assign["LID"])}/>
                          </div>
                          <p style={{fontWeight:'normal'}}>Open</p>
                      </div>
                      </div>
                    </div>
                  </button>
                </div>
                )
              })
            ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignList;