import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import { Download, QrCodeScan, Search, Funnel, Plus, ThreeDotsVertical, CaretDownFill } from 'react-bootstrap-icons';
import Cookies from 'js-cookie';
import Shimmer from '../../components/Shimmer';

const host = `${process.env.REACT_APP_HOST}`

const StatusDropdown = ({ assign, toggleLock, setIsButtonClicked }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }} onClick={(e) => { e.stopPropagation(); setIsButtonClicked(true); }}>
      <button 
        type="button"
        style={{ 
          width: '100px', 
          backgroundColor: assign["Lock"] ? '#fee2e2' : '#dcfce7', 
          border: assign["Lock"] ? '1px solid #ef4444' : '1px solid #22c55e', 
          borderRadius: '6px', 
          color: assign["Lock"] ? '#ef4444' : '#22c55e', 
          fontWeight: 'bold', 
          padding: '4px 12px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer' 
        }}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => { setTimeout(() => setIsOpen(false), 200); setIsButtonClicked(false); }}
      >
        <span>{assign["Lock"] ? "Closed" : "Open"}</span>
        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>
      </button>
      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          marginTop: '4px', 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '6px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          zIndex: 10, 
          width: '100px', 
          overflow: 'hidden' 
        }}>
          <div 
            style={{ padding: '8px', cursor: 'pointer', color: '#22c55e', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }} 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); if(assign["Lock"]) toggleLock(e, assign["LID"]); }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Open
          </div>
          <div 
            style={{ padding: '8px', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', textAlign: 'center' }} 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); if(!assign["Lock"]) toggleLock(e, assign["LID"]); }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Closed
          </div>
        </div>
      )}
    </div>
  );
};

const parseDateStr = (dateStr) => {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const parts = dateStr.split(/[\s/:]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const hours = parts.length > 3 ? parseInt(parts[3], 10) : 0;
      const minutes = parts.length > 4 ? parseInt(parts[4], 10) : 0;
      return new Date(year, month, day, hours, minutes);
    }
  }
  return new Date(dateStr);
};

const getTimeDiff = (dateStr) => {
  const targetDate = parseDateStr(dateStr);
  if (!targetDate || isNaN(targetDate.getTime())) return null;
  
  const diffMs = targetDate - new Date();
  if (diffMs <= 0) return null;
  
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  return `${diffMins}m`;
};

const hasArrived = (dateStr) => {
  const targetDate = parseDateStr(dateStr);
  if (!targetDate || isNaN(targetDate.getTime())) return false;
  return targetDate <= new Date();
};

const getCourseBannerStyle = (courseStr) => {
  if (!courseStr) return {};
  
  let hash = 0;
  for (let i = 0; i < courseStr.length; i++) {
    hash = courseStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 50 + Math.abs(hash >> 2) % 70) % 360; 
  const h3 = (h2 + 50 + Math.abs(hash >> 4) % 70) % 360; 
  
  const color1 = `hsl(${h1}, 85%, 82%)`;
  const color2 = `hsl(${h2}, 85%, 82%)`;
  const color3 = `hsl(${h3}, 85%, 82%)`;
  const color4 = `hsl(${(h1 + 120) % 360}, 80%, 86%)`;
  const color5 = `hsl(${(h2 + 180) % 360}, 80%, 88%)`;

  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.65'/%3E%3C/svg%3E")`;

  const meshGradient = `
    radial-gradient(at 10% 20%, ${color1} 0%, transparent 60%),
    radial-gradient(at 90% 10%, ${color2} 0%, transparent 60%),
    radial-gradient(at 20% 90%, ${color3} 0%, transparent 60%),
    radial-gradient(at 80% 90%, ${color4} 0%, transparent 60%),
    radial-gradient(at 50% 50%, ${color5} 0%, transparent 60%)
  `;

  return {
    backgroundColor: `hsl(${h1}, 60%, 90%)`,
    backgroundImage: `${noiseSvg}, ${meshGradient}`,
    backgroundBlendMode: 'overlay, normal, normal, normal, normal, normal',
    color: '#374151',
  };
};

function AssignList() {
  
  const navigate = useNavigate();
  const [ClassInfo, setClassInfo] = useState({});
  const [classId,] = useState(sessionStorage.getItem("classId"));
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const displayClassInfo = loading ? { ClassID: '0000000', ClassName: 'Loading Class Name...', ClassYear: '2024/1', Thumbnail: 'null' } : ClassInfo;

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

    Promise.all([fetchClass(), fetchData()]).finally(() => {
      setLoading(false);
    });
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <style>
          {`
          @media (max-width: 768px) {
              .responsive-container {
                  margin-left: 1rem !important;
                  margin-right: 1rem !important;
              }
              .responsive-banner {
                  padding-left: 1rem !important;
                  padding-right: 1rem !important;
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
          `}
      </style>
      <div style={{ flexShrink: 0 }}>
        <Navbar />
        <Shimmer isLoading={loading} height="300px">
          {displayClassInfo && (
          <div className="responsive-banner" style={{ ...getCourseBannerStyle(displayClassInfo['ClassID'] + displayClassInfo['ClassName']), marginTop: '-60px', paddingTop: 'calc(3rem + 60px)', paddingRight: '10vw', paddingBottom: '3rem', paddingLeft: '10vw', width: '100%', minHeight: '300px', marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={displayClassInfo['Thumbnail'] ? `${host}/Thumbnail/` + displayClassInfo['Thumbnail'] : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} alt="course" style={{ width: '80px', height: '80px', borderRadius: '50%', marginRight: '1.5rem', objectFit: 'cover', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
              <div>
                <h2 style={{ fontWeight: 'bold', margin: 0, fontSize: '2.5rem', letterSpacing: '-0.5px' }}>{displayClassInfo['ClassName'] || '\u00A0'}</h2>
                <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', padding: '0.3rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '0.8rem', color: '#1f2937', border: '1px solid rgba(255, 255, 255, 0.5)', borderTop: '1px solid rgba(255,255,255,0.8)', borderLeft: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)', textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}>
                  {displayClassInfo['ClassID'] || '.......'} • {displayClassInfo['ClassYear'] || '.......'}
                </div>
              </div>
            </div>
          </div>
          )}
        </Shimmer>
      </div>

      <div className="responsive-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginLeft: '10vw', marginRight: '10vw', marginBottom: '2vh' }}>
        <div style={{ flexShrink: 0, backgroundColor: 'white', position: 'sticky', top: '56px', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #d3d3d3' }}>
            <div className="tab-scroll-container" style={{ display: 'flex' }}>
              <div style={{ padding: '10px 40px', fontWeight: 'bold', fontSize: '1.2rem', color: '#495057', borderBottom: '3px solid #df4d8e', cursor: 'pointer', marginBottom: '-2px' }}>
                Assignments
              </div>
              <div style={{ padding: '10px 40px', fontSize: '1.2rem', color: '#495057', cursor: 'pointer' }} onClick={() => navigate("/StudentList")}>
                Students
              </div>
            </div>
            <div>
            </div>
          </div>
          <div style={{ paddingTop: '1rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button style={{marginLeft: "1.5rem", backgroundColor: "#e25595", color: "white", border: "none", borderRadius: "20px", padding: "8px 20px"}} type="button" onClick={() => navigate("/AssignCreate")} >+ New Assignment</button>
            <button type="button" className="btn btn-dark" style={{ borderRadius: '20px', padding: '8px 20px', fontWeight: 'bold', marginRight: '1.5rem', border: 'none' }} onClick={() => navigate("/Scan")}><QrCodeScan style={{ marginRight: '5px' }} /> Scan QR</button>
          </div>
        </div>
          <div style={{ flexGrow: 1, paddingLeft: 0, paddingRight: 0, paddingBottom: '10px' }}>
            <div style={{ minWidth: '900px' }}>
              <div className="row text-muted" style={{ fontSize: '0.9rem', marginLeft: 0, marginRight: 0, marginBottom: '1rem', fontWeight: 'bold', position: 'sticky', top: '166px', backgroundColor: 'white', zIndex: 10, paddingTop: '10px', paddingBottom: '10px', borderBottom: '2px solid #dee2e6', marginTop: '-10px' }}>
                <div className="col-1 text-center">Lab Number</div>
                <div className="col" style={{ paddingLeft: '2rem' }}>Lab Name</div>
                <div style={{ width: '130px', textAlign: 'center' }}>Status</div>
                <div style={{ width: '220px', textAlign: 'center' }}>Publish</div>
                <div style={{ width: '220px', textAlign: 'center' }}>Due</div>
              </div>
            <Shimmer isLoading={loading}>
              {(loading ? [
                { LID: "dummy1", Lab: " ", Name: " ", Publish: " ", Due: " ", Lock: false },
                { LID: "dummy2", Lab: " ", Name: " ", Publish: " ", Due: " ", Lock: false },
                { LID: "dummy3", Lab: " ", Name: " ", Publish: " ", Due: " ", Lock: false }
              ] : assignmentsData).map((assign, index) => {
                // If it's a dummy item, don't execute handleRedirect
                const onClickAction = loading ? undefined : () => handleRedirect(assign["LID"]);
                
                return (
                <div key={assign["LID"] || index} className='card shimmer-target-container' style={{ marginBottom: '1rem', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'visible' }} onClick={onClickAction}>
                  <div className='row align-items-center' style={{ margin: 0, width: '100%', height: '5rem', cursor: loading ? 'default' : 'pointer', flexWrap: 'nowrap' }}>
                    <div className='col-1 d-flex justify-content-center align-items-center shimmer-target' style={{ backgroundColor: '#f3f4f6', height: '100%', fontWeight: 'bold', fontSize: '1.2rem', color: '#374151', borderTopLeftRadius: '9px', borderBottomLeftRadius: '9px', minWidth: '40px' }}>
                      {assign["Lab"] || '\u00A0'}
                    </div>
                    <div className='col shimmer-target' style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#374151', textAlign: 'left', paddingLeft: '2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', minWidth: '100px' }}>
                      {assign["Name"] || '\u00A0'}
                    </div>
                    <div className='d-flex justify-content-center' style={{ width: '130px' }}>
                      <StatusDropdown assign={assign} toggleLock={toggleLock} setIsButtonClicked={setIsButtonClicked} />
                    </div>
                    <div className='d-flex align-items-center justify-content-center' style={{ width: '220px' }}>
                      <span className="shimmer-target" style={{ 
                        border: hasArrived(assign["Publish"]) ? '1px solid #e5e7eb' : '1px solid #d1d5db', 
                        borderRadius: '6px', 
                        padding: '0.4rem 0.6rem', 
                        fontSize: '0.9rem', 
                        color: hasArrived(assign["Publish"]) ? '#9ca3af' : '#4b5563', 
                        fontWeight: 'bold', 
                        backgroundColor: hasArrived(assign["Publish"]) ? '#f3f4f6' : 'white', 
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        minWidth: '80px'
                      }}>
                        {assign["Publish"] || '\u00A0'}
                      </span>
                      {getTimeDiff(assign["Publish"]) && (
                        <span className="shimmer-target" style={{ color: '#9ca3af', fontSize: '0.85rem', marginLeft: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {getTimeDiff(assign["Publish"])}
                        </span>
                      )}
                    </div>
                    <div className='d-flex align-items-center justify-content-center' style={{ width: '220px' }}>
                      <span className="shimmer-target" style={{ 
                        border: hasArrived(assign["Due"]) ? '1px solid #e5e7eb' : '1px solid #d1d5db', 
                        borderRadius: '6px', 
                        padding: '0.4rem 0.6rem', 
                        fontSize: '0.9rem', 
                        color: hasArrived(assign["Due"]) ? '#9ca3af' : '#4b5563', 
                        fontWeight: 'bold', 
                        backgroundColor: hasArrived(assign["Due"]) ? '#f3f4f6' : 'white', 
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        minWidth: '80px'
                      }}>
                        {assign["Due"] || '\u00A0'}
                      </span>
                      {getTimeDiff(assign["Due"]) && (
                        <span className="shimmer-target" style={{ color: '#9ca3af', fontSize: '0.85rem', marginLeft: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {getTimeDiff(assign["Due"])}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                )
              })}
            </Shimmer>
            </div>
          </div>
        </div>
      </div>
  )
}

export default AssignList;