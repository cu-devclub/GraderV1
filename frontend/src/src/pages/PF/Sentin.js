import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import {Download} from 'react-bootstrap-icons';


const host = `${process.env.REACT_APP_HOST}`

function Sentin() {
  const navigate = useNavigate();

  const [classId,] = useState(sessionStorage.getItem("classId"));
  const [LID,] = useState(sessionStorage.getItem("LID"))
  const [ClassInfo, setClassInfo] = useState({});

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

  const handleToggleDropdown = (index) => {
    setOpenDropdown((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
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
                  <button className="nav-link active" >Sent in</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/AssignSus")}} >Suspicious</button>
                </li>
                <li className="nav-item">
                  { isExamFromServ ? (<button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/CheckInOut")}} >Check in-out</button>) : ("")}
                </li>
              </ul>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary float-end" type="button" onClick={() => navigate("/AssignList")}>Back</button>
              <button className="btn btn-outline-dark float-end" type="button" onClick={() => {downall()}} style={{marginRight: "1em"}}>Download all</button>
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
                  <th scope="col" className="col-1 text-center">Score</th>
                </tr>
              </thead>
              <tbody>
                {Scores ? (
                  Scores["Students"].filter(element => (
                    (element["UID"] + element["Name"]).toLowerCase().includes(searchQuery.toLowerCase())
                  )).map((element, index) => (
                    <React.Fragment key={index}>
                      <tr>
                        <th scope="row">{index + 1}</th>
                        <td>{element["UID"]}</td>
                        <td>{element["Name"]}</td>
                        <td className='text-center'>
                          <button 
                              className="btn btn-secondary dropdown-toggle" 
                              type="button" 
                              onClick={() => handleToggleDropdown(index)}
                              aria-expanded={openDropdown[index] || false}
                            >
                            {element["AllScore"]}/{Scores.AllMaxScore}
                          </button>
                        </td>
                      </tr>
                      {openDropdown[index] && (
                        <tr>
                          <td colSpan="5">
                            <table className="table" style={{margin: "0px"}}>
                              <thead>
                              </thead>
                              <tbody>
                                {element["SMT"].map((smt, smtIndex) => (
                                  <tr key={smtIndex}>
                                    <div className='row' style={{color: `${smt["Late"] ? 'red' : 'black'}`}}>
                                      <div className='col'>
                                        Q{smtIndex + 1}: {smt["Time"]}
                                      </div>
                                      <div className='col-2'>
                                        {smt["Score"]}/{smt["MaxScore"]}
                                      </div>
                                      <div className='col-1'>
                                        {smt["SID"] > -1 ? <button type="button" class="btn btn-outline-dark" onClick={() => {loadSub(smt["SID"])}}><Download /></button>: ""}
                                      </div>
                                    </div>
                                    {/* <td style={{color: `${smt["Late"] ? 'red' : 'black'}`}}>Q{smtIndex + 1}: {smt["Time"]}</td>
                                    <td style={{color: `${smt["Late"] ? 'red' : 'black'}`}}>{smt["Score"]}/{smt["MaxScore"]}</td>
                                    <td style={{color: `${smt["Late"] ? 'red' : 'black'}`}}><button type="button" class="btn btn-outline-dark" onClick={() => {loadSub(smt["SID"])}}><Download /></button></td> */}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
    </div>
  );
}

export default Sentin;