import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import { Download, Search, Funnel, Trash, PencilSquare } from 'react-bootstrap-icons';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`

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

function StudentList() {
  const navigate = useNavigate();

  const [id, ] = useState(Cookies.get('uid'))
  const [searchQuery, setSearchQuery] = useState('');
  const [showname, setshowname] = useState([])
  
  const [sections, setSections] = useState([]);
  const [checkedSections, setCheckedSections] = useState([])

  const [ClassInfo, setClassInfo] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [UID,setUID] = useState("");
  const [Name,setName] = useState("");
  const [Section,setSection] = useState("");
  const [Group,setGroup] = useState("");

  // const [Email,] = useState(Cookies.get("email"));
  const [classId,] = useState(sessionStorage.getItem("classId"));

  const fetchName = async () => {
    try {
      const response = await fetch(`${host}/TA/Student/List?CSYID=${classId}`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        }
      });
      const dataname = await response.json();
      setshowname(dataname["data"]["Students"]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Display an error message to the user
    }
  };

  useEffect(() => {
    const fetchName = async () => {
      try {
        const response = await fetch(`${host}/TA/Student/List?CSYID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const dataname = await response.json();
        setshowname(dataname["data"]["Students"]);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Display an error message to the user
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

    const fetchSection = async () => {
      try {
        const response = await fetch(`${host}/TA/class/classes/section?CSYID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        setSections(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchClass();
    fetchSection();
    fetchName();
  }, [classId]);

  const handleExport = async () => {
    try {
      const formData = new FormData();
      formData.append('CSV_data', JSON.stringify({
        CSV_data: showname, // Convert CSV_data to JSON string
        CSYID: classId
    }),);

      const response = await fetch(`${host}/TA/Student/List/CSV`, {
        method: 'POST',
        credentials: "include",
        headers: {
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        },
            body: formData
      })
      const data = await response.json();
      
      const url = window.URL.createObjectURL(new Blob([data["data"]["csv"]], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', data["data"]["filename"]);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      // Display an error message to the user
    }
  };

  const handleExportSepQ = async () => {
    try {
      const response = await fetch(`${host}/TA/Student/List/CSVQ?CSYID=${classId}`, {
        method: 'GET',
        credentials: "include",
        headers: {
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        },
      })
      const data = await response.json();
      
      const url = window.URL.createObjectURL(new Blob([data["data"]["csv"]], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', data["data"]["filename"]);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };
  

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCheckboxChange = (e) => {
    if(checkedSections.includes(e)){
      setCheckedSections(checkedSections.filter((item) => item !== e))
    }else{
      setCheckedSections([...checkedSections, e])
    }
  }

  const handleEditStudent = async (toEdit) => {
    setUID(toEdit["ID"])
    setName(toEdit["Name (English)"])
    setSection(toEdit["Section"])
    setGroup(toEdit["Group"])
    setShowModal(true);
    setIsEdit(true);
  }

  const handleAddStudent = async () => {
    setUID("")
    setName("")
    setSection("")
    setGroup(showname.length > 0 ? (showname[0]["Group"] === '-' ? '-' : '') : '')
    setShowModal(true);
    setIsEdit(false)
  }

  const RemoveStudent = async () => {
    const bd = JSON.stringify({
      "SID": UID,
      "CSYID": classId
    })

    try {
      withReactContent(Swal).fire({
        html: `<div class="pos-center">
                    <div class="loader"></div>
                </div> `,
        showCloseButton: false,
        showCancelButton: false,
        showConfirmButton: false,
        background: "rgba(0, 0, 0, 0)"
      })
      const response = await fetch(`${host}/TA/Student/remove`, {
        method: 'POST',
        credentials: "include",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "X-CSRF-TOKEN": Cookies.get('csrf_token')
        },
        body: bd
      });
      const responseData = await response.json();
      withReactContent(Swal).close()
      if (responseData["success"]){
        withReactContent(Swal).fire({
          title: responseData["msg"],
          icon: "success"
        })
        setShowModal(false);
        fetchName()
      }else{
        withReactContent(Swal).fire({
          title: "Error!",
          icon: "error",
          text: responseData["msg"]
        })
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      withReactContent(Swal).close()
      withReactContent(Swal).fire({
        title: "There is error!",
        icon: "error"
      })
    }
  }

  const SaveStudent = async () => {
    const bd = JSON.stringify({
      "SID": UID,
      "Name": Name,
      "Section": Section,
      "Group": Group,
      "CSYID": classId
    })

    try {
      withReactContent(Swal).fire({
        html: `<div class="pos-center">
                    <div class="loader"></div>
                </div> `,
        showCloseButton: false,
        showCancelButton: false,
        showConfirmButton: false,
        background: "rgba(0, 0, 0, 0)"
      })
      const response = await fetch(`${host}/TA/Student/${isEdit?"edit":"add"}`, {
        method: 'POST',
        credentials: "include",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          "X-CSRF-TOKEN": Cookies.get('csrf_token')
        },
        body: bd
      });
      const responseData = await response.json();
      withReactContent(Swal).close()
      if (responseData["success"]){
        withReactContent(Swal).fire({
          title: responseData["msg"],
          icon: "success"
        })
        setShowModal(false);
        fetchName()
      }else{
        withReactContent(Swal).fire({
          title: "Error!",
          icon: "error",
          text: responseData["msg"]
        })
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      withReactContent(Swal).close()
      withReactContent(Swal).fire({
        title: "There is error!",
        icon: "error"
      })
    }
    
  }

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflowX: 'hidden', overflowY: 'hidden' }}>
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
        <div style={{ ...getCourseBannerStyle(ClassInfo['ClassID'] + ClassInfo['ClassName']), marginTop: '-60px', paddingTop: 'calc(3rem + 60px)', paddingRight: '10vw', paddingBottom: '3rem', paddingLeft: '10vw', width: '100%', minHeight: '300px', marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
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

      <div className="responsive-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden', marginLeft: '10vw', marginRight: '10vw', marginBottom: '2vh' }}>
        <div style={{ flexShrink: 0, backgroundColor: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #d3d3d3' }}>
            <div className="tab-scroll-container" style={{ display: 'flex' }}>
              <div style={{ padding: '10px 40px', fontSize: '1.2rem', color: '#495057', cursor: 'pointer' }} onClick={() => navigate("/AssignList")}>
                Assignments
              </div>
              <div style={{ padding: '10px 40px', fontWeight: 'bold', fontSize: '1.2rem', color: '#495057', borderBottom: '3px solid #df4d8e', cursor: 'pointer', marginBottom: '-2px' }}>
                Students
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginRight: '1.5rem', marginBottom: '5px' }}>
              {/* Export buttons moved */}
            </div>
          </div>
          <div style={{ paddingTop: '1rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button style={{marginLeft: "1.5rem", backgroundColor: "#e25595", color: "white", border: "none", borderRadius: "20px", padding: "8px 20px"}} type="button" onClick={() => handleAddStudent()} >+ Add Student</button>
            
            <div className="dropdown" style={{ marginRight: '1.5rem', position: 'relative' }}>
              <button 
                className="btn btn-outline-secondary dropdown-toggle" 
                style={{ borderRadius: '20px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px' }} 
                type="button" 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              >
                <Download size={18} />
                Export
              </button>
              {showExportDropdown && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setShowExportDropdown(false)}></div>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm show" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', borderRadius: '12px', border: 'none', padding: '8px', zIndex: 1000, minWidth: '200px' }}>
                    <li><button className="dropdown-item" style={{ borderRadius: '8px' }} type="button" onClick={() => { setShowExportDropdown(false); handleExport(); }}>Total scores</button></li>
                    <li><button className="dropdown-item" style={{ borderRadius: '8px' }} type="button" onClick={() => { setShowExportDropdown(false); handleExportSepQ(); }}>Scores by question</button></li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
        <div style={{ flexGrow: 1, overflow: 'auto', paddingBottom: '10px' }}>
          {/* Search input */}
          <form className="d-flex" style={{marginBottom: "8px"}}>
            <input className="form-control me-2" type="search" placeholder="Search ID or Name" aria-label="Search" onChange={handleSearch} />
          </form>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1.5rem', marginTop: '1rem' }}>
            <b style={{ marginRight: '1rem', color: '#495057', marginTop: '2px', fontSize: '0.95rem' }}>Section:</b>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '400px' }}>
              {sections.map((section) => {
                const isSelected = checkedSections.includes(section);
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => handleCheckboxChange(section)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      border: isSelected ? '1px solid #e25595' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#e25595' : 'white',
                      color: isSelected ? 'white' : '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      padding: 0
                    }}
                  >
                    {section}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Loading indicator */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className='fixed_header'>
          <table className="table" style={{ minWidth: '600px' }}>
              <thead>
                  <tr>
                      <th scope="col" className="col-1">#</th>
                      <th scope="col" className="col-2">Student ID</th>
                      <th scope="col">Name</th>
                      <th scope="col" className="col-1 text-center">Section</th>
                      <th scope="col" className="col-1 text-center">Group</th>
                      <th scope="col" className="col-1 text-center">Score</th>
                      <th scope="col" className="col-1 text-center">Edit</th>
                  </tr>
              </thead>
              <tbody>
          {showname.length !== 0 ? (
              showname.filter(element => {
                if((element["ID"] + element["Name (English)"]).toLowerCase().includes(searchQuery.toLowerCase()) && (checkedSections.length === 0 || checkedSections.includes(element["Section"])))
                  return element;
                return false
              }).map((element, index) => (
                  <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{element["ID"]}</td>
                      <td>{element["Name (English)"]}</td>
                      <td className='text-center'>{element["Section"]}</td>
                      <td className='text-center'>{element["Group"]}</td>
                      <td className='text-center'>{element["Score"]}/{element["MaxScore"]}</td>
                      <td className='text-center'>
                        <button type="button" className="btn btn-warning" onClick={() => {handleEditStudent(element)}}>
                          <PencilSquare/>
                        </button>
                      </td>
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
          <br />
        </div>
      </div>





      <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{ display: showModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel"> {isEdit ? "Edit" : "Add"}  </h5>
              <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Student ID</label>
                  <input type="text" className="form-control" placeholder="Student ID" value={UID} onChange={(e) => {setUID(e.target.value)}} disabled={isEdit}/>
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-control" placeholder="Name" value={Name} onChange={(e) => {setName(e.target.value)}}/>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input type="number" className="form-control" placeholder="Section" value={Section} onChange={(e) => {setSection(e.target.value)}}/>
                </div>
                <div className="form-group">
                  <label>Group</label>
                  <input type="text" className="form-control" placeholder="Group" value={Group} onChange={(e) => {setGroup(e.target.value)}} disabled={Group === "-"}/>
                </div>
              </form>
            </div>
            <div className="modal-footer" style={{justifyContent: "flex-start"}}>
              <button type="button" className="btn btn-outline-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
            {isEdit ? (
              <button type="button" className="btn btn-danger" onClick={RemoveStudent}>
                Remove
              </button>
            ):(null)}
              <button type="button" className="btn btn-success" onClick={SaveStudent}>
                {isEdit ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentList;