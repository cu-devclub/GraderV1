import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { Funnel } from 'react-bootstrap-icons';


const host = `${process.env.REACT_APP_HOST}`

function Sentin() {
    const navigate = useNavigate();

    const [classId,] = useState(sessionStorage.getItem("classId"));
    const [LID,] = useState(sessionStorage.getItem("LID"))
    const [ClassInfo, setClassInfo] = useState({});

    const isExamFromServ = sessionStorage.getItem("isExam") === 'true';

    const [Sus, setSus] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [SQ, setSQ] = useState([]);
    const [ST, setST] = useState([]);
      
    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleQuestionChange = (e) => {
        if(SQ.includes(e)){
          setSQ(SQ.filter((item) => item !== e));
        }else{
          setSQ([...SQ, e]);
        }
    };

    const handleTypeChange = (e) => {
        if(ST.includes(e)){
          setST(ST.filter((item) => item !== e));
        }else{
          setST([...ST, e]);
        }
    };

    useEffect(() => {
        const fetchSus = async () => {
            try {
                const response = await fetch(`${host}/TA/class/Assign/Suspicious?LID=${LID}`, {
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
                    setSus(data.data);
                    setSQ(data.data['Q'])
                    setST(data.data['Type'])
                }
            } catch (error) {
                console.error('Error fetching suspicious data:', error);
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
        fetchSus()
    }, [LID, classId]);

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
                                    <button className="nav-link active" >Suspicious</button>
                                </li>
                                <li className="nav-item">
                                    { isExamFromServ ? (<button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/CheckInOut")}} >Check in-out</button>) : ("")}
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-primary float-end" type="button" onClick={() => navigate("/AssignList")}>Back</button>
                        </div>
                    </div>
                </div>
                <div className="card-body" style={{ overflowY: 'scroll' }}>
                    <button type="button" className="btn btn-outline-dark" onClick={handleOpenModal}><Funnel /> Filter</button>
                {/* Loading indicator */}
                    <div className='fixed_header'>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col" className="col-1">#</th>
                                    <th scope="col" className="col-1">Student ID</th>
                                    <th scope="col" className='col-1'>Question</th>
                                    <th scope="col" className='col-1'>Type</th>
                                    <th scope="col">Reason</th>
                                    <th scope="col" className='col-2'>Timestamp</th>
                                    {/* <th scope="col" className="col-1 text-center">Type</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {Sus && Sus['Sus'].length !== 0 ? (
                                    Sus['Sus'].filter(element => (
                                        SQ.includes(element["QID"]) && ST.includes(element["Type"])
                                        // (element["UID"] + element["Name"]).toLowerCase().includes(searchQuery.toLowerCase())
                                    )).map((element, index) => (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <th scope="row">{index + 1}</th>
                                                <td>{element["UID"]}</td>
                                                <td>{element["QID"]}</td>
                                                <td>{element["Type"]}</td>
                                                <td>{element["Reason"]}</td>
                                                <td>{element["Timestamp"]}</td>
                                                {/* <td className='text-center'></td> */}
                                            </tr>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <th scope="row"></th>
                                        <td>No data</td>
                                        <td></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: showModal ? 'block' : 'none' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title"><Funnel /> Filter</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {Sus ? (
                                <div>
                                    <b>Question:</b><br/>
                                    {Sus['Q'].map((element) => (
                                        <div key={element} className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`inlineCheckbox${element}`}
                                                value={element}
                                                checked={SQ.includes(element)}
                                                onChange={() => handleQuestionChange(element)}
                                            />
                                            <label className="form-check-label" htmlFor={`inlineCheckbox${element}`}>
                                                {element}
                                            </label>
                                        </div>
                                    ))}
                                    <br/><b>Type:</b><br/>
                                    {Sus['Type'].map((element) => (
                                        <div key={element} className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`inlineCheckbox${element}`}
                                                value={element}
                                                checked={ST.includes(element)}
                                                onChange={() => handleTypeChange(element)}
                                            />
                                            <label className="form-check-label" htmlFor={`inlineCheckbox${element}`}>
                                                {element}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>Loading</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sentin;