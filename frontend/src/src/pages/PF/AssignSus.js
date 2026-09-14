import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ArrowLeftCircle, Funnel, FunnelFill } from 'react-bootstrap-icons';


const host = `${process.env.REACT_APP_HOST}`

const TYPE_LABELS = {
    1: 'File not contain signature',
    2: 'Signature is broken',
    3: "Submit someone else's file",
    4: 'Submit wrong question',
    5: 'Cannot decrypt signature'
};

function Sentin() {
    const navigate = useNavigate();

    const [classId,] = useState(sessionStorage.getItem("classId"));
    const [LID,] = useState(sessionStorage.getItem("LID"))
    const [ClassInfo, setClassInfo] = useState({});

    const isExamFromServ = sessionStorage.getItem("isExam") === 'true';

    const [Sus, setSus] = useState(null);

    const [SQ, setSQ] = useState([]);
    const [ST, setST] = useState([]);

    const [showQFilter, setShowQFilter] = useState(false);
    const [showTFilter, setShowTFilter] = useState(false);

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

    const isQFiltered = SQ.length > 0;
    const isTFiltered = ST.length > 0;

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
            .filter-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                margin-top: 4px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                padding: 10px;
                z-index: 1000;
                min-width: 160px;
                white-space: normal;
            }
            .filter-dropdown-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.85rem;
                color: #334155;
                font-weight: 400;
                transition: background-color 0.15s;
            }
            .filter-dropdown-item:hover {
                background-color: #f8fafc;
            }
            .filter-pill {
                width: 18px;
                height: 18px;
                border-radius: 4px;
                border: 1.5px solid #cbd5e1;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: all 0.2s;
            }
            .filter-pill.selected {
                background-color: #e25595;
                border-color: #e25595;
            }
            .filter-icon-btn {
                background: none;
                border: none;
                padding: 2px;
                cursor: pointer;
                color: #94a3b8;
                display: inline-flex;
                align-items: center;
                margin-left: 4px;
                vertical-align: middle;
                transition: color 0.15s;
            }
            .filter-icon-btn:hover {
                color: #64748b;
            }
            .filter-icon-btn.active {
                color: #e25595;
            }
            .sticky-table-header th {
                position: sticky;
                top: 94px;
                background-color: white;
                z-index: 10;
                box-shadow: inset 0 -2px 0 #cbd5e1;
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
        <div className="card responsive-container" style={{ marginLeft: '10em', marginRight: '10em', border: 'none', boxShadow: 'none' }}>
            <div style={{ backgroundColor: 'white', position: 'sticky', top: '56px', zIndex: 100 }}>
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
                        <div style={{ padding: '10px 40px', fontWeight: '600', fontSize: '1.05rem', color: '#1e293b', borderBottom: '2px solid #e25595', cursor: 'pointer', marginBottom: '-1px' }}>
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
                <div className="card-body">
                    <div style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div>
                        <table className="table" style={{ minWidth: '700px' }}>
                            <thead className="sticky-table-header">
                                <tr>
                                    <th scope="col" style={{ width: '50px' }}>#</th>
                                    <th scope="col" style={{ width: '120px' }}>Student ID</th>
                                    <th scope="col" style={{ width: '120px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Question
                                            <button
                                                type="button"
                                                className={`filter-icon-btn ${isQFiltered ? 'active' : ''}`}
                                                onClick={() => { setShowQFilter(!showQFilter); setShowTFilter(false); }}
                                            >
                                                {isQFiltered ? <FunnelFill size={12} /> : <Funnel size={12} />}
                                            </button>
                                        </div>
                                        {showQFilter && Sus && (
                                            <>
                                                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setShowQFilter(false)} />
                                                <div className="filter-dropdown">
                                                    {Sus['Q'].map((q) => {
                                                        const isSelected = SQ.includes(q);
                                                        return (
                                                            <div key={q} className="filter-dropdown-item" onClick={() => handleQuestionChange(q)}>
                                                                <div className={`filter-pill ${isSelected ? 'selected' : ''}`}>
                                                                    {isSelected && <span style={{ color: 'white', fontSize: '11px', lineHeight: 1 }}>&#10003;</span>}
                                                                </div>
                                                                <span>Question {q}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </th>
                                    <th scope="col" style={{ width: '220px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Type
                                            <button
                                                type="button"
                                                className={`filter-icon-btn ${isTFiltered ? 'active' : ''}`}
                                                onClick={() => { setShowTFilter(!showTFilter); setShowQFilter(false); }}
                                            >
                                                {isTFiltered ? <FunnelFill size={12} /> : <Funnel size={12} />}
                                            </button>
                                        </div>
                                        {showTFilter && Sus && (
                                            <>
                                                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setShowTFilter(false)} />
                                                <div className="filter-dropdown" style={{ minWidth: '240px' }}>
                                                    {Sus['Type'].map((t) => {
                                                        const isSelected = ST.includes(t);
                                                        return (
                                                            <div key={t} className="filter-dropdown-item" onClick={() => handleTypeChange(t)}>
                                                                <div className={`filter-pill ${isSelected ? 'selected' : ''}`}>
                                                                    {isSelected && <span style={{ color: 'white', fontSize: '11px', lineHeight: 1 }}>&#10003;</span>}
                                                                </div>
                                                                <span>{TYPE_LABELS[t] || `Type ${t}`}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </th>
                                    <th scope="col">Reason</th>
                                    <th scope="col" style={{ width: '180px' }}>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Sus && Sus['Sus'].length !== 0 ? (
                                    Sus['Sus'].filter(element => (
                                        (SQ.length === 0 || SQ.includes(element["QID"])) && 
                                        (ST.length === 0 || ST.includes(element["Type"]))
                                    )).map((element, index) => (
                                        <React.Fragment key={index}>
                                            <tr>
                                                <th scope="row">{index + 1}</th>
                                                <td>{element["UID"]}</td>
                                                <td>{element["QID"]}</td>
                                                <td>{TYPE_LABELS[element["Type"]] || element["Type"]}</td>
                                                <td>{element["Reason"]}</td>
                                                <td>{element["Timestamp"]}</td>
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
            </div>
        </div>
    );
}

export default Sentin;