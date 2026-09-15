import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Shimmer from '../../components/Shimmer';

import { PersonCheck, PersonSlash, BoxArrowLeft, BoxArrowInRight, ArrowLeftCircle, Search } from 'react-bootstrap-icons';


const host = `${process.env.REACT_APP_HOST}`

function Checkio() {
    const navigate = useNavigate();

    const [classId,] = useState(sessionStorage.getItem("classId"));
    const [LID,] = useState(sessionStorage.getItem("LID"))
    const [ClassInfo, setClassInfo] = useState({});
  const [loading, setLoading] = useState(true);

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
      <style>
          {`
          @media (max-width: 768px) {
              .responsive-container {
                  margin-left: 1rem !important;
                  margin-right: 1rem !important;
              }
          }
          .tab-scroll-container {
              display: flex;
              overflow-x: auto;
              white-space: nowrap;
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
          .tab-scroll-container::-webkit-scrollbar {
              display: none;
          }
          .sticky-table-header th {
              position: sticky;
              top: 154px; /* adjusted because tabs and buttons are ~100px */
              background-color: white;
              z-index: 10;
              box-shadow: inset 0 -2px 0 #dee2e6;
          }
          `}
      </style>
      <Navbar />
      <br />
      <div className="responsive-container" style={{ marginLeft: '10em', marginRight: '10em', marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '38px' }}>
        <div style={{ color: '#e25595', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 'bold' }} onClick={() => navigate("/AssignList")}>
          <ArrowLeftCircle size={18} /> <span style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>Back to assignment</span>
        </div>
      </div>
      <div className="responsive-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginLeft: '10vw', marginRight: '10vw', marginBottom: '2vh' }}>
        <div style={{ flexShrink: 0, backgroundColor: 'white', position: 'sticky', top: '56px', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #cbd5e1' }}>
            <div className="tab-scroll-container" style={{ display: 'flex', width: '100%' }}>
              <div style={{ padding: '10px 40px', fontSize: '1.05rem', color: '#64748b', cursor: 'pointer', marginBottom: '-1px' }} onClick={() => {navigate("/AssignEdit", { state: { tab: 'Detail' } })}}>
                Detail
              </div>
              <div style={{ padding: '10px 40px', fontSize: '1.05rem', color: '#64748b', cursor: 'pointer', marginBottom: '-1px' }} onClick={() => {navigate("/AssignEdit", { state: { tab: 'Questions' } })}}>
                Questions
              </div>
              <div style={{ padding: '10px 40px', fontSize: '1.05rem', color: '#64748b', cursor: 'pointer', marginBottom: '-1px' }} onClick={() => {navigate("/AssignEdit", { state: { tab: 'Files' } })}}>
                Additional Files
              </div>
              <div style={{ padding: '10px 40px', fontSize: '1.05rem', color: '#64748b', cursor: 'pointer', marginBottom: '-1px' }} onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/Sentin")}}>
                Submission
              </div>
              <div style={{ padding: '10px 40px', fontSize: '1.05rem', color: '#64748b', cursor: 'pointer', marginBottom: '-1px' }} onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/AssignSus")}}>
                Suspicious
              </div>
              <div style={{ padding: '10px 40px', fontWeight: '600', fontSize: '1.05rem', color: '#1e293b', borderBottom: '2px solid #e25595', cursor: 'pointer', marginBottom: '-1px' }}>
                Check in-out
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem', marginBottom: '1rem', paddingRight: '1.5rem' }}>
            <button type="button" onClick={checkallout} style={{ padding: '6px 20px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '30px', fontWeight: '600', transition: 'all 0.2s', cursor: 'pointer', fontSize: '0.9rem' }}>Check out all</button>
            <button type="button" onClick={checkallin} style={{ padding: '6px 20px', backgroundColor: '#e25595', border: 'none', color: 'white', borderRadius: '30px', fontWeight: '600', transition: 'all 0.2s', cursor: 'pointer', fontSize: '0.9rem' }}>Check in all</button>
          </div>
        </div>
        <div style={{ flexGrow: 1, paddingBottom: '10px' }}>
          <div style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="table">
              <thead className="sticky-table-header">
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
      
      {/* Floating Search Island */}
      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 900, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '12px 24px', borderRadius: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', width: '90%', maxWidth: '450px' }}>
        <Search size={20} style={{ color: '#64748b', marginRight: '12px' }} />
        <input 
          type="search" 
          placeholder="Search ID or Name" 
          value={searchQuery}
          onChange={handleSearch} 
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1.05rem', color: '#334155' }} 
        />
      </div>
    </div>
  );
}

export default Checkio;