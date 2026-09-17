import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Shimmer from '../../components/Shimmer';
import { Download, ArrowLeftCircle, Search } from 'react-bootstrap-icons';


const host = `${process.env.REACT_APP_HOST}`

function Sentin() {
  const navigate = useNavigate();

  const [classId,] = useState(sessionStorage.getItem("classId"));
  const [LID,] = useState(sessionStorage.getItem("LID"))
  const [ClassInfo, setClassInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const isExamFromServ = sessionStorage.getItem("isExam") === 'true';

  const [Scores, setScores] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');



  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(`${host}/TA/class/score?LID=${LID}`, {
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
          setScores(data.data);
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
    fetchScores()
  }, [LID, classId]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const [openDropdown, setOpenDropdown] = useState({});
  const [studentSMT, setStudentSMT] = useState({});
  const [loadingSMT, setLoadingSMT] = useState({});

  const handleToggleDropdown = async (uid) => {
    const nextState = !openDropdown[uid];
    setOpenDropdown((prevState) => ({
      ...prevState,
      [uid]: nextState,
    }));

    if (nextState && !studentSMT[uid]) {
      setLoadingSMT((prev) => ({ ...prev, [uid]: true }));
      try {
        const response = await fetch(`${host}/TA/student/score?UID=${uid}&LID=${LID}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        if (data.success) {
          setStudentSMT((prev) => ({
            ...prev,
            [uid]: data.data.SMT || data.data
          }));
        } else {
          withReactContent(Swal).fire({
            title: data.msg || "Failed to fetch student score",
            icon: "error"
          });
        }
      } catch (error) {
        console.error('Error fetching student score:', error);
      } finally {
        setLoadingSMT((prev) => ({ ...prev, [uid]: false }));
      }
    }
  };

  const loadSub = async (SID) => {
    fetch(`${process.env.REACT_APP_HOST}/TA/class/Assign/downloadSub`, {
      method: 'POST',
      credentials: "include",
      headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          "X-CSRF-TOKEN": await Cookies.get("csrf_token")
      },
      body: JSON.stringify({ SID: SID})
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
          // Decode base64-encoded file content
          const decodedFileContent = atob(data.fileContent);

          // Convert decoded content to a Uint8Array
          const arrayBuffer = new Uint8Array(decodedFileContent.length);
          for (let i = 0; i < decodedFileContent.length; i++) {
              arrayBuffer[i] = decodedFileContent.charCodeAt(i);
          }

          // Create a Blob from the array buffer
          const blob = new Blob([arrayBuffer], { type: data.fileType });

          // Create a temporary URL to the blob
          const url = window.URL.createObjectURL(blob);

          // Create a link element to trigger the download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = data.downloadFilename;
          document.body.appendChild(a);
          a.click();

          // Clean up by revoking the object URL
          window.URL.revokeObjectURL(url);
        }else{
          withReactContent(Swal).fire({
            title: data.msg,
            icon: "error"
          })
        }
    })
    .catch(error => console.error('Error:', error));
  }

  const downall = async () => {
    fetch(`${process.env.REACT_APP_HOST}/TA/class/Assign/downloadSubZip`, {
      method: 'POST',
      credentials: "include",
      headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          "X-CSRF-TOKEN": await Cookies.get("csrf_token")
      },
      body: JSON.stringify({ LID: LID})
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
          // Decode base64-encoded file content
          const decodedFileContent = atob(data.fileContent);

          // Convert decoded content to a Uint8Array
          const arrayBuffer = new Uint8Array(decodedFileContent.length);
          for (let i = 0; i < decodedFileContent.length; i++) {
              arrayBuffer[i] = decodedFileContent.charCodeAt(i);
          }

          // Create a Blob from the array buffer
          const blob = new Blob([arrayBuffer], { type: data.fileType });

          // Create a temporary URL to the blob
          const url = window.URL.createObjectURL(blob);

          // Create a link element to trigger the download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = data.downloadFilename;
          document.body.appendChild(a);
          a.click();

          // Clean up by revoking the object URL
          window.URL.revokeObjectURL(url);
        }else{
          withReactContent(Swal).fire({
            title: data.msg,
            icon: "error"
          })
        }
    })
    .catch(error => console.error('Error:', error));
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
              top: 104px; /* adjusted because tabs are at 56px + ~48px height */
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
        <button type="button" onClick={() => {downall()}} style={{ padding: '6px 20px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '30px', fontWeight: '600', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Download size={16} /> Download all submission
        </button>
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
              <div style={{ padding: '10px 40px', fontWeight: '600', fontSize: '1.05rem', color: '#1e293b', borderBottom: '2px solid #e25595', cursor: 'pointer', marginBottom: '-1px' }}>
                Submission
              </div>
              <div style={{ padding: '10px 40px', fontSize: '1.05rem', color: '#64748b', cursor: 'pointer', marginBottom: '-1px' }} onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/AssignSus")}}>
                Suspicious
              </div>
              { isExamFromServ && (
                <div style={{ padding: '10px 40px', fontSize: '1.05rem', color: '#64748b', cursor: 'pointer', marginBottom: '-1px' }} onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/CheckInOut")}}>
                  Check in-out
                </div>
              )}
            </div>
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
                  <th scope="col" className="col-1 text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {Scores ? (
                  Scores["Students"].filter(element => (
                    (element["UID"] + element["Name"]).toLowerCase().includes(searchQuery.toLowerCase())
                  )).map((element, index) => (
                    <React.Fragment key={element["UID"] || index}>
                      <tr>
                        <th scope="row">{index + 1}</th>
                        <td>{element["UID"]}</td>
                        <td>{element["Name"]}</td>
                        <td className='text-center'>
                          <button 
                              className="btn btn-secondary dropdown-toggle" 
                              type="button" 
                              onClick={() => handleToggleDropdown(element["UID"])}
                              aria-expanded={openDropdown[element["UID"]] || false}
                            >
                            {element["AllScore"]}/{Scores.AllMaxScore}
                          </button>
                        </td>
                      </tr>
                      {openDropdown[element["UID"]] && (
                        <tr>
                          <td colSpan="5">
                            {loadingSMT[element["UID"]] ? (
                              <div className="text-center p-2">Loading...</div>
                            ) : (studentSMT[element["UID"]] || element["SMT"]) && (studentSMT[element["UID"]] || element["SMT"]).length > 0 ? (
                              <table className="table" style={{margin: "0px"}}>
                                <thead>
                                </thead>
                                <tbody>
                                  {(studentSMT[element["UID"]] || element["SMT"]).map((smt, smtIndex) => (
                                    <tr key={smtIndex}>
                                      <div className='row' style={{color: `${smt["Late"] ? 'red' : 'black'}`}}>
                                        <div className='col'>
                                          Q{smtIndex + 1}: {smt["Time"]}
                                        </div>
                                        <div className='col-2'>
                                          {smt["Score"]}/{smt["MaxScore"]}
                                        </div>
                                        <div className='col-1'>
                                          {smt["SID"] > -1 ? <button type="button" className="btn btn-outline-dark" onClick={() => {loadSub(smt["SID"])}}><Download /></button>: ""}
                                        </div>
                                      </div>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-center p-2">No submission data</div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

export default Sentin;