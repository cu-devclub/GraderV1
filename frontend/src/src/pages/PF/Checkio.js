import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { PersonCheck, PersonSlash, BoxArrowLeft, BoxArrowInRight } from 'react-bootstrap-icons';


const host = `${process.env.REACT_APP_HOST}`

function Checkio() {
    const navigate = useNavigate();

    const [classId,] = useState(sessionStorage.getItem("classId"));
    const [LID,] = useState(sessionStorage.getItem("LID"))
    const [ClassInfo, setClassInfo] = useState({});

    const [student, setStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchStudent = async () => {
        try {
            const response = await fetch(`${host}/TA/class/Assign/Exam/list?LID=${LID}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            }
            });
            const data = await response.json();
            if(data.success){
            setStudent(data.data);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await fetch(`${host}/TA/class/Assign/Exam/list?LID=${LID}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "X-CSRF-TOKEN": Cookies.get("csrf_token")
                }
                });
                const data = await response.json();
                if(data.success){
                setStudent(data.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
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
        fetchStudent()
    }, [LID, classId]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const rqchkio = async (data) => {
        withReactContent(Swal).fire({
            title: `\nPlease Review these Information`,
            html: `
                <div class='row' style="width:100%;">
                    <div class='col-4' style="text-align:left;margin-left:5em;">
                        <b>UID</b><br/>
                        <b>Name</b><br/>
                        <b>Type</b>
                    </div>
                    <div class='col' style="text-align:left">
                        ${data.UID} <br/>
                        ${data.Name} <br/>
                        ${data.Type === 0 ? "Leave" : "Enter"}
                    </div>
                </div>`,
            showCloseButton: true,
            showCancelButton: true,
            focusConfirm: false,
            confirmButtonText: `Confirm`,
            confirmButtonColor: "rgb(35, 165, 85)",
        }).then(async ok => {
            if(ok.isConfirmed){
                try{
                    const response = await fetch(`${host}/TA/class/Assign/Exam/check${data.Type === 0 ? "out":"in"}`, {
                        method: 'POST',
                        credentials: "include",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                            "Access-Control-Allow-Origin": "*",
                            "X-CSRF-TOKEN": Cookies.get("csrf_token")
                        },
                        body: JSON.stringify({ LID: LID, UID: data.UID, CSYID: classId })
                    })
                    const Data = await response.json()
                    if (Data.success){
                        withReactContent(Swal).fire({
                            title: "Complete!",
                            icon: "success"
                        })
                        fetchStudent()
                    }else{
                        withReactContent(Swal).fire({
                            title: Data.msg,
                            icon: Data.data
                        })
                    }
                }catch (error) {
                    withReactContent(Swal).fire({
                        title: "Please contact admin!",
                        text: error,
                        icon: "error"
                    })
                }
            }
        })
    }

    const checkallin = async () => {
      withReactContent(Swal).fire({
        title: `\nConfirm Check-In`,
        text: "Are you sure you want to check in all students?",
        icon: "question",
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: `Confirm`,
        confirmButtonColor: "rgb(35, 165, 85)",
    }).then(async ok => {
        if(ok.isConfirmed){
            try{
                const response = await fetch(`${host}/TA/class/Assign/Exam/checkinall`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    },
                    body: JSON.stringify({ LID: LID})
                })
                const Data = await response.json()
                if (Data.success){
                    withReactContent(Swal).fire({
                        title: "Complete!",
                        icon: "success"
                    })
                    fetchStudent()
                }else{
                    withReactContent(Swal).fire({
                        title: Data.msg,
                        icon: Data.data
                    })
                }
            }catch (error) {
                withReactContent(Swal).fire({
                    title: "Please contact admin!",
                    text: error,
                    icon: "error"
                })
            }
        }
      })
    }

    const checkallout = async () => {
      withReactContent(Swal).fire({
        title: `\nConfirm Check-Out`,
        text: "Are you sure you want to check out all students?",
        icon: "question",
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: `Confirm`,
        confirmButtonColor: "rgb(35, 165, 85)",
      }).then(async ok => {
        if(ok.isConfirmed){
            try{
                const response = await fetch(`${host}/TA/class/Assign/Exam/checkoutall`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    },
                    body: JSON.stringify({ LID: LID})
                })
                const Data = await response.json()
                if (Data.success){
                    withReactContent(Swal).fire({
                        title: "Complete!",
                        icon: "success"
                    })
                    fetchStudent()
                }else{
                    withReactContent(Swal).fire({
                        title: Data.msg,
                        icon: Data.data
                    })
                }
            }catch (error) {
                withReactContent(Swal).fire({
                    title: "Please contact admin!",
                    text: error,
                    icon: "error"
                })
            }
        }
      })
    }

  return (
    <div>
      <Navbar />
      <br />
      <div className="media d-flex align-items-center">
        <span style={{ margin: '0 10px' }}></span>
        <img className="mr-3" alt="thumbnail" src={ClassInfo['Thumbnail'] ? `${host}/Thumbnail/` + ClassInfo['Thumbnail'] : "https://cdn-icons-png.flaticon.com/512/3426/3426653.png"} style={{ width: '40px', height: '40px' }} />
        <span style={{ margin: '0 10px' }}></span>
        <div className="card" style={{ width: '30rem', padding: '10px' }}>
          <h5>{ClassInfo['ClassID']} {ClassInfo['ClassName']} {ClassInfo['ClassYear']}</h5>
          <h6>Instructor: {ClassInfo['Instructor']}</h6>
        </div>
      </div>
      <br />
      <div className="card" style={{ marginLeft: '10em', marginRight: '10em', maxHeight: "70vh"}}>
        <div className="card-header">
          <div className="row" style={{marginBottom:"-5px"}}>
            <div className="col">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button className="nav-link link" onClick={() => {navigate("/AssignEdit")}}>Edit</button>
                </li>
                <li className="nav-item">
                <button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/Sentin")}} >Sent in</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/AssignSus")}} >Suspicious</button>
                </li>
                <li className="nav-item">
                <button className="nav-link active" >Check in-out</button>
                </li>
              </ul>
            </div>
            <div className="col-auto">
              <button className="btn btn-primary float-end" type="button" onClick={() => navigate("/AssignList")}>Back</button>
              <button type="button" className="btn btn-secondary float-end" style={{marginRight:"1em"}} onClick={checkallout}>Check out all</button>
              <button type="button" className="btn btn-secondary float-end" style={{marginRight:"1em"}} onClick={checkallin}>Check in all</button>
            </div>
          </div>
        </div>
        <div className="card-body" style={{ overflowY: 'scroll' }}>
          <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="Search ID or Name" aria-label="Search" onChange={handleSearch} />
          </form>
          <br />
          {/* Loading indicator */}
          <div className='fixed_header'>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col" className="col-1">#</th>
                  <th scope="col" className="col-2">Student ID</th>
                  <th scope="col">Name</th>
                  <th scope="col" className="col-1 text-center">Status</th>
                  <th scope="col" className="col-1 text-center">Edit</th>
                </tr>
              </thead>
              <tbody>
                {student ? (
                  student.filter(element => (
                    (element["UID"] + element["Name"]).toLowerCase().includes(searchQuery.toLowerCase())
                  )).map((element, index) => (
                      <tr>
                        <th scope="row">{index + 1}</th>
                        <td>{element["UID"]}</td>
                        <td>{element["Name"]}</td>
                        {/* <td className='text-center'>{element["checkedOut"] === 1 ? <a style={{color: "rgb(137, 32, 32)"}}><PersonSlash/></a> : <a style={{color: "rgb(61, 146, 35)"}}><PersonCheck/></a>}</td> */}
                        <td className="text-center">
                            {element.checkedOut === 1 ? (
                                <button
                                type="button"
                                style={{ color: "rgb(137, 32, 32)", background: "none", border: "none" }}
                                aria-label="Checked out"
                                >
                                <PersonSlash />
                                </button>
                            ) : (
                                <button
                                type="button"
                                style={{ color: "rgb(61, 146, 35)", background: "none", border: "none" }}
                                aria-label="Available"
                                >
                                <PersonCheck />
                                </button>
                            )}
                        </td>
                        <td className='text-center'>{element["checkedOut"] === 1 ? <button type="button" class="btn btn-success" onClick={() => {rqchkio({Type: 1, UID: element["UID"], Name: element["Name"]})}}><BoxArrowInRight/></button> : <button type="button" class="btn btn-danger" onClick={() => {rqchkio({Type: 0, UID: element["UID"], Name: element["Name"]})}}><BoxArrowLeft/></button>}</td>
                      </tr>
                  ))
                  ) : (
                  <tr>
                    <th scope="row"></th>
                    <td>No data</td>
                    <td></td>
                  </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkio;