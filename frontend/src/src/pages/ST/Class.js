import React,{ useState,useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`;

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

function Index() {
  const navigate = useNavigate();

  const [assignmentData, setAssignmentData] = useState(null);
  const classId = sessionStorage.getItem("classId")

  const [ClassInfo, setClassInfo] = useState(null)

  useEffect(() => {
    document.body.style.backgroundColor = "#FFF"
    const fetchData = async () => {
      try {
        const response = await fetch(`${host}/ST/assignment/all?CID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        setAssignmentData(data.data);
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

    fetchClass()
    fetchData();
  }, [classId]);

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
        {ClassInfo && (
        <div className="responsive-banner" style={{ ...getCourseBannerStyle(ClassInfo['ClassID'] + ClassInfo['ClassName']), marginTop: '-60px', paddingTop: 'calc(3rem + 60px)', paddingRight: '10vw', paddingBottom: '3rem', paddingLeft: '10vw', width: '100%', minHeight: '300px', marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={ClassInfo['Thumbnail'] ? `${host}/Thumbnail/` + ClassInfo['Thumbnail'] : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} alt="course" style={{ width: '80px', height: '80px', borderRadius: '50%', marginRight: '1.5rem', objectFit: 'cover', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            <div>
              <h2 style={{ fontWeight: 'bold', margin: 0, fontSize: '2.5rem', letterSpacing: '-0.5px' }}>{ClassInfo['ClassName']}</h2>
              <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', padding: '0.3rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '0.8rem', color: '#1f2937', border: '1px solid rgba(255, 255, 255, 0.5)', borderTop: '1px solid rgba(255,255,255,0.8)', borderLeft: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)', textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}>
                {ClassInfo['ClassID']} • {ClassInfo['ClassYear']}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="responsive-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginLeft: '10vw', marginRight: '10vw', marginBottom: '2vh' }}>
        <div style={{ flexShrink: 0, backgroundColor: 'white', position: 'sticky', top: '56px', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #d3d3d3' }}>
            <div className="tab-scroll-container" style={{ display: 'flex' }}>
              <div style={{ padding: '10px 40px', fontWeight: 'bold', fontSize: '1.2rem', color: '#495057', borderBottom: '3px solid #df4d8e', cursor: 'pointer', marginBottom: '-2px' }}>
                Lab
              </div>
              <div style={{ padding: '10px 40px', fontSize: '1.2rem', color: '#495057', cursor: 'pointer' }} onClick={() => navigate("/portfolio")}>
                Portfolio
              </div>
            </div>
          </div>
        </div>
        <div style={{ flexGrow: 1, overflowX: 'auto', paddingLeft: 0, paddingRight: 0, paddingBottom: '10px', paddingTop: '1rem' }}>
          <div style={{ minWidth: '900px' }}>
            <div className="row text-muted" style={{ fontSize: '0.9rem', marginLeft: 0, marginRight: 0, marginBottom: '1rem', fontWeight: 'bold' }}>
              <div className="col-1 text-center">Lab Number</div>
              <div className="col" style={{ paddingLeft: '2rem' }}>Lab Name</div>
              <div style={{ width: '220px', textAlign: 'center' }}>Publish</div>
              <div style={{ width: '220px', textAlign: 'center' }}>Due</div>
              <div style={{ width: '130px', textAlign: 'center' }}>Score</div>
            </div>
            <div>
              {assignmentData && ((assignmentData.length !== 0) && (
              assignmentData.map(assign => {
                return (
                <div key={assign["LID"]} className='card' style={{ marginBottom: '1rem', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'visible', position: 'relative' }} onClick={() => {sessionStorage.setItem("LID", assign["LID"]); navigate("/Lab")}}>
                  {assign.TurnIn === false && (
                     <span style={{ position: 'absolute', top: '-5px', right: '-5px', height: '15px', width: '15px', backgroundColor: '#e25595', borderRadius: '50%', border: '2px solid white', zIndex: 10 }}></span>
                  )}
                  <div className='row align-items-center' style={{ margin: 0, width: '100%', height: '5rem', cursor: 'pointer', flexWrap: 'nowrap' }}>
                    <div className='col-1 d-flex justify-content-center align-items-center' style={{ backgroundColor: '#f3f4f6', height: '100%', fontWeight: 'bold', fontSize: '1.2rem', color: '#374151', borderTopLeftRadius: '9px', borderBottomLeftRadius: '9px' }}>
                      {assign["Lab"]}
                    </div>
                    <div className='col' style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#374151', textAlign: 'left', paddingLeft: '2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {assign["Name"]}
                    </div>
                    <div className='d-flex align-items-center justify-content-center' style={{ width: '220px' }}>
                      <span style={{ 
                        border: hasArrived(assign["Publish"]) ? '1px solid #e5e7eb' : '1px solid #d1d5db', 
                        borderRadius: '6px', 
                        padding: '0.4rem 0.6rem', 
                        fontSize: '0.9rem', 
                        color: hasArrived(assign["Publish"]) ? '#9ca3af' : '#4b5563', 
                        fontWeight: 'bold', 
                        backgroundColor: hasArrived(assign["Publish"]) ? '#f3f4f6' : 'white', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {assign["Publish"]}
                      </span>
                      {getTimeDiff(assign["Publish"]) && (
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem', marginLeft: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {getTimeDiff(assign["Publish"])}
                        </span>
                      )}
                    </div>
                    <div className='d-flex align-items-center justify-content-center' style={{ width: '220px' }}>
                      <span style={{ 
                        border: hasArrived(assign["Due"]) ? '1px solid #e5e7eb' : '1px solid #d1d5db', 
                        borderRadius: '6px', 
                        padding: '0.4rem 0.6rem', 
                        fontSize: '0.9rem', 
                        color: hasArrived(assign["Due"]) ? '#9ca3af' : (assign.Late ? '#ef4444' : '#4b5563'), 
                        fontWeight: 'bold', 
                        backgroundColor: hasArrived(assign["Due"]) ? '#f3f4f6' : (assign.Late ? '#fef2f2' : 'white'), 
                        whiteSpace: 'nowrap' 
                      }}>
                        {assign["Due"]}
                      </span>
                      {getTimeDiff(assign["Due"]) && (
                        <span style={{ color: assign.Late ? '#ef4444' : '#9ca3af', fontSize: '0.85rem', marginLeft: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {getTimeDiff(assign["Due"])}
                        </span>
                      )}
                    </div>
                    <div className='d-flex align-items-center justify-content-center' style={{ width: '130px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {assign["hideScore"] ? "-" : `${assign["Score"]}/${assign["MaxScore"]}`}
                    </div>
                  </div>
                </div>
                )
              })
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
