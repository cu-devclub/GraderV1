import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import Navbar from '../../components/Navbar'
import { useNavigate} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Shimmer from '../../components/Shimmer';
import { Download, ThreeDotsVertical } from 'react-bootstrap-icons';
import CustomModal from '../../components/CustomModal';

const host = `${process.env.REACT_APP_HOST}`


function ClassEdit() {
    const navigate = useNavigate();

    const [modalConfig, setModalConfig] = useState({
        show: false,
        title: '',
        message: '',
        type: 'alert', // 'alert' or 'prompt'
        inputValue: '',
        onConfirm: () => {},
        confirmText: 'Confirm',
        confirmColor: 'primary'
    });

    const [CSYID, ] = useState(sessionStorage.getItem("classId"));

    const [classData, setClassData] = useState(null)
    const displayClassData = classData || { classid: '', ClassID: '', SchoolYear: '', ClassName: '', Thumbnail: 'null', Archive: false };

    const [classID, setClassID] = useState('');
  const [loading, setLoading] = useState(true);
    const [schoolYear, setSchoolYear] = useState('');
    const [className, setClassName] = useState('');
    const [Archive, setArchive] = useState(sessionStorage.getItem("Archive") === 'true')
    const [activeTab, setActiveTab] = useState('class');

    const [sections, setSections] = useState([]);
    const [groups, setGroups] = useState([]);
    const [newSection, setNewSection] = useState('');
    const [newGroup, setNewGroup] = useState('');

    const [pictureFile, setPictureFile] = useState(null);
    const [studentFile, setStudentFile] = useState(null);

    const [isDraggingPic, setIsDraggingPic] = useState(false);
    const [isDraggingStu, setIsDraggingStu] = useState(false);

    const onDragOverPic = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingPic(true); };
    const onDragLeavePic = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingPic(false); };
    const onDropPicture = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingPic(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) setPictureFile(e.dataTransfer.files[0]); };

    const onDragOverStu = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingStu(true); };
    const onDragLeaveStu = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingStu(false); };
    const onDropStudent = (e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingStu(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) setStudentFile(e.dataTransfer.files[0]); };

    const [timestamps, setTimestamps] = useState(Array(2).fill('')); // กำหนดขนาดของอาร์เรย์ตามจำนวนที่ต้องการใช้งาน (ในที่นี้คือ 2)

    
    useEffect(() => {
        const fetchClass = async () => {
        try {
            const response = await fetch(`${host}/TA/class/class?CSYID=${CSYID}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            }
            });
            const data = await response.json();
            setClassData({
                classid: CSYID,
                ClassID: data["ClassID"],
                SchoolYear: data["ClassYear"],
                ClassName: data["ClassName"],
                Thumbnail: data["Thumbnail"],
                Archive: data["Archive"]
            });
            setClassID(data["ClassID"]);
            setSchoolYear(data["ClassYear"]);
            setClassName(data["ClassName"])
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };  
      
        const fetchSectionsAndGroups = async () => {
            try {
                const secRes = await fetch(`${host}/TA/class/classes/section?CSYID=${CSYID}&include_count=true`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    }
                });
                const secData = await secRes.json();
                setSections(Array.isArray(secData) ? secData : []);

                const grpRes = await fetch(`${host}/TA/class/classes/group?CSYID=${CSYID}&include_count=true`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    }
                });
                const grpData = await grpRes.json();
                setGroups(Array.isArray(grpData) ? grpData : []);
            } catch (error) {
                console.error('Error fetching sec/grp:', error);
            }
        };

        Promise.all([fetchClass(), fetchSectionsAndGroups()]).finally(() => setLoading(false));
    }, [CSYID]);

    const handleEditClick = async () => {
        try{
            withReactContent(Swal).fire({
                title: `Are you sure to update class with these infomations?`,
                html: `
                    <div class='row' style="width:100%;">
                        <div class='col-4' style="text-align:left;margin-left:5em;">
                            Class name<br/>
                            Class ID<br/>
                            schoolyear
                        </div>
                        <div class='col' style="text-align:left">
                            ${className} <br/>
                            ${classID} <br/>
                            ${schoolYear}
                        </div>
                    </div>`,
                icon: "question",
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: false,
                confirmButtonText: `Yes`,
                confirmButtonColor: "rgb(35, 165, 85)",
            }).then(async ok => {
                if(ok.isConfirmed){
                    const formData = new FormData();
                    formData.append('ClassName', className);
                    formData.append('ClassID',classID)
                    formData.append('SchoolYear',schoolYear)
                    formData.append('CSYID',CSYID)

                    const response = await fetch(`${host}/TA/class/edit`, {
                        method: 'POST',
                        credentials: "include",
                        headers: {
                            "X-CSRF-TOKEN": Cookies.get("csrf_token")
                        },
                        body: formData,
                    });
                    const responseData = await response.json();
                    if (responseData.Status){
                        withReactContent(Swal).fire({
                            title: "Infomation updated",
                            icon: "success"
                        }).then(ok => {
                            if(ok)
                                window.location.href = "/"
                        });
                    }else{
                        withReactContent(Swal).fire({
                        title: "Error!",
                        icon: "error"
                        })
                    }
                }
            });
        }catch (error) {
            withReactContent(Swal).fire({
                title: "Please contact admin!",
                text: error,
                icon: "error"
            })
        }
    }

    const handleUpload = async (index) => {
      // Get the current date and time
        const now = new Date();
        const formattedTimestamp = now.toLocaleString();
        const response = null
  

      /* Thumbnail */
        if(index === 0){
            if(!pictureFile){
                withReactContent(Swal).fire({
                    title: "Please select file!",
                    icon: "warning"
                })
                return
            }
            const fileThumbnail = pictureFile;

            const formData = new FormData();
            formData.append('CSYID', CSYID)
            formData.append('file',fileThumbnail)

            try {
                const response = await fetch(`${host}/upload/Thumbnail`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    },
                    body: formData,
                });
                const responseData = await response.json();
                
                if (responseData["success"]){
                    withReactContent(Swal).fire({
                        title: "Thumbnail uploaded",
                        icon: "success"
                    }).then(ok => {
                        if(ok)
                            window.location.href = "/"
                    });
                }else{
                    withReactContent(Swal).fire({
                        title: "Error!",
                        icon: "error"
                    })
                }
            } catch (error) {
                withReactContent(Swal).fire({
                    title: "Please contact admin!",
                    text: error,
                    icon: "error"
                })
            }
        }
      /* CSV */
        if (index === 1) {
            if(!studentFile){
                withReactContent(Swal).fire({
                    title: "Please select file!",
                    icon: "warning"
                })
                return
            }
            const fileCSV = studentFile;
        
            const formData = new FormData();
            formData.append('CSYID', CSYID)
            formData.append('file', fileCSV)
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
                const response = await fetch(`${host}/upload/CSV`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    },
                    body: formData,
                });
                const responseData = await response.json();
                withReactContent(Swal).close()
                if (responseData["success"]){
                    withReactContent(Swal).fire({
                        title: "CSV uploaded",
                        icon: "success"
                    })
                }else{
                    withReactContent(Swal).fire({
                        title: "Error!",
                        icon: "error",
                        text: responseData["msg"]
                    })
                }
            } catch (error) {
                withReactContent(Swal).fire({
                    title: "Please contact admin!",
                    text: error,
                    icon: "error"
                })
            }
        }
    

        if(response){
            setTimestamps(prevTimestamps => {
                const newTimestamps = [...prevTimestamps];
                newTimestamps[index] = formattedTimestamp;
                return newTimestamps;
            })
        };
    };

    // Too danger
    // const handleDelete = async () =>{
    //     try {
    //         withReactContent(Swal).fire({
    //             title: "Are you sure to delete this class?",
    //             icon: "warning",
    //             showCloseButton: true,
    //             showCancelButton: true,
    //             focusConfirm: false,
    //             confirmButtonText: `Delete`,
    //             confirmButtonColor: "rgb(217, 39, 39)",
    //         }).then(async ok => {
    //             if(ok.isConfirmed){
    //                 const formData = new FormData();
    //                 formData.append('CSYID',CSYID)

    //                 const response = await fetch(`${host}/TA/class/delete`, {
    //                     method: 'POST',
    //                     credentials: "include",
    //                     headers: {
    //                         "X-CSRF-TOKEN": Cookies.get("csrf_token")
    //                     },
    //                     body: formData,
    //                 });
    //                 const responseData = await response.json();
    //                 if (responseData.Status){
    //                     withReactContent(Swal).fire({
    //                         title: "Class Deleted",
    //                         icon: "success"
    //                     }).then(ok => {
    //                         if(ok)
    //                             window.location.href = "/"
    //                     });
    //                 }else{
    //                     withReactContent(Swal).fire({
    //                       title: "Error!",
    //                       icon: "error"
    //                     })
    //                 }
    //             }
    //         });
    //     }catch (error) {
    //         withReactContent(Swal).fire({
    //             title: "Please contact admin!",
    //             text: error,
    //             icon: "error"
    //         })
    //     }
    // }

    const handleArchive = async () =>{
        try {
            withReactContent(Swal).fire({
                title: `Are you sure to ${Archive ? "una" : "a"}rchive this class?`,
                icon: "warning",
                showCloseButton: true,
                showCancelButton: true,
                focusConfirm: false,
                confirmButtonText: `${Archive ? "Una" : "A"}rchive`,
                confirmButtonColor: "rgb(217, 39, 39)",
            }).then(async ok => {
                if(ok.isConfirmed){
                    const formData = new FormData();
                    formData.append('CSYID',CSYID)

                    fetch(`${host}/TA/class/Archive`, {
                        method: 'POST',
                        credentials: "include",
                        headers: {
                            "X-CSRF-TOKEN": Cookies.get("csrf_token")
                        },
                        body: formData,
                    })
                    .then(response => response.json())
                    .then(data => {
                        withReactContent(Swal).fire({
                            title: data.msg,
                            icon: data.success ? "success" : "error"
                        }).then(() => {
                            setArchive(!Archive)
                        });
                    })
                }
            });
        }catch (error) {
            withReactContent(Swal).fire({
                title: "Please contact admin!",
                text: error,
                icon: "error"
            })
        }
    }

    const handleClassIDChange = (e) => {
        setClassID(e.target.value);
    }
    
    const handleSchoolYearChange = (e) => {
        setSchoolYear(e.target.value);
    }
    
    const handleClassNameChange = (e) => {
        setClassName(e.target.value);
    }

    let isCreateButtonDisabled = true

    if(classData) {
        const savebutcondi1 = classID === displayClassData.ClassID && schoolYear === displayClassData.SchoolYear && className === displayClassData.ClassName;
        const savebutcondi2 = !classID || !schoolYear || !className;
        isCreateButtonDisabled = savebutcondi1 || savebutcondi2;
    }
    
    const handleGenTemplate = () => {
        const url = window.URL.createObjectURL(new Blob(["ID,Name (English),Section,Group\n"], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', "StudentList-Template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const downfile = async () => {
        fetch(`${process.env.REACT_APP_HOST}/glob/download`, {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            },
            body: JSON.stringify({ fileRequest: `3_0_${CSYID}`})
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

    const refreshSecGrp = () => {
        fetch(`${host}/TA/class/classes/section?CSYID=${CSYID}&include_count=true`, { credentials: "include", headers: { "X-CSRF-TOKEN": Cookies.get("csrf_token") } })
            .then(res => res.json())
            .then(data => setSections(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
        fetch(`${host}/TA/class/classes/group?CSYID=${CSYID}&include_count=true`, { credentials: "include", headers: { "X-CSRF-TOKEN": Cookies.get("csrf_token") } })
            .then(res => res.json())
            .then(data => setGroups(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
    };

    const handleCreateSection = async () => {
        if (!newSection) return;
        try {
            const res = await fetch(`${host}/TA/class/classes/section`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": Cookies.get("csrf_token") },
                body: JSON.stringify({ CSYID: CSYID, Section: newSection })
            });
            const data = await res.json();
            if (data.success) { setNewSection(''); refreshSecGrp(); } else { Swal.fire('Error', data.msg, 'error'); }
        } catch (error) { console.error(error); }
    };

    const closeCustomModal = () => setModalConfig(prev => ({ ...prev, show: false }));

    const handleDeleteSection = (sectionName) => {
        setModalConfig({
            show: true,
            title: `Delete Section`,
            message: `Are you sure you want to delete section "${sectionName || '(Empty)'}"? It must be empty.`,
            type: 'alert',
            confirmText: 'Yes, delete it!',
            confirmColor: 'danger',
            onConfirm: async () => {
                closeCustomModal();
                try {
                    const res = await fetch(`${host}/TA/class/classes/section`, {
                        method: "DELETE",
                        credentials: "include",
                        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": Cookies.get("csrf_token") },
                        body: JSON.stringify({ CSYID: CSYID, Section: sectionName })
                    });
                    const data = await res.json();
                    if (data.success) { refreshSecGrp(); } else { Swal.fire('Error', data.msg, 'error'); }
                } catch (error) { console.error(error); }
            }
        });
    };

    const handleCreateGroup = async () => {
        if (!newGroup) return;
        try {
            const res = await fetch(`${host}/TA/class/classes/group`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": Cookies.get("csrf_token") },
                body: JSON.stringify({ CSYID: CSYID, Group: newGroup })
            });
            const data = await res.json();
            if (data.success) { setNewGroup(''); refreshSecGrp(); } else { Swal.fire('Error', data.msg, 'error'); }
        } catch (error) { console.error(error); }
    };

    const handleDeleteGroup = (groupName) => {
        setModalConfig({
            show: true,
            title: `Delete Group`,
            message: `Are you sure you want to delete group "${groupName || '(Empty)'}"? It must be empty.`,
            type: 'alert',
            confirmText: 'Yes, delete it!',
            confirmColor: 'danger',
            onConfirm: async () => {
                closeCustomModal();
                try {
                    const res = await fetch(`${host}/TA/class/classes/group`, {
                        method: "DELETE",
                        credentials: "include",
                        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": Cookies.get("csrf_token") },
                        body: JSON.stringify({ CSYID: CSYID, Group: groupName })
                    });
                    const data = await res.json();
                    if (data.success) { refreshSecGrp(); } else { Swal.fire('Error', data.msg, 'error'); }
                } catch (error) { console.error(error); }
            }
        });
    };

  return (
    <div>
        <Navbar></Navbar> 
        <br></br>
        <div className="card" style={{ marginLeft: 10 +'em', marginRight: 10 + 'em' }}>
            <div className="card-header">
                <div className="row" style={{marginBottom:"-5px"}}>
                    <div className="col">
                        <ul className="nav nav-tabs card-header-tabs">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'class' ? 'active' : 'link'}`} onClick={() => setActiveTab('class')}>Class</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'picture' ? 'active' : 'link'}`} onClick={() => setActiveTab('picture')}>Picture</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'student' ? 'active' : 'link'}`} onClick={() => setActiveTab('student')}>Student</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'secgrp' ? 'active' : 'link'}`} onClick={() => setActiveTab('secgrp')}>Sec/Group</button>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link link" onClick={() => {sessionStorage.setItem("CSYID", displayClassData.classid);navigate("/TAmanage")}} >TA</button>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-dark float-end" type="button" style={{ marginLeft:"20px", borderRadius: "20px", padding: "8px 20px", fontWeight: "bold", border: "none" }} onClick={() => navigate("/")}>Back</button>
                    </div>
                </div>
            </div>
            <div className="card-body">
                {activeTab === 'class' && (
                    <>
                        <h3>Information</h3>
                        <br/>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label htmlFor="inputID" className="form-label">Class ID*</label>
                                <Shimmer isLoading={loading}><input type="text" className="form-control" id="inputID" placeholder="ex. 2301233 (7 digits number)" value={classID} onChange={handleClassIDChange} /></Shimmer>
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="inputYear" className="form-label">School Year/Semester*</label>
                                <Shimmer isLoading={loading}><input type="text" className="form-control" id="inputYear" placeholder="ex. 2020/1" value={schoolYear} onChange={handleSchoolYearChange}/></Shimmer>
                            </div>
                            <div className="col-6">
                                <label htmlFor="inputName" className="form-label">Class Name*</label>
                                <Shimmer isLoading={loading}><input type="text" className="form-control" id="inputClass" placeholder="Name" value={className} onChange={handleClassNameChange}/></Shimmer>
                            </div>
                        </div>
                        <div className="row" style={{marginTop: "10px",marginBottom: "20px"}}>
                            <div className="col">
                                <button type="button" className="btn float-end" disabled={isCreateButtonDisabled} onClick={handleEditClick} style={{ backgroundColor: "#e25595", color: "white", border: "none", borderRadius: "20px", padding: "8px 20px", fontWeight: "bold" }}>Save</button>
                                <button type="button" className="btn btn-outline-danger float-end" style={{marginRight: "10px", borderRadius: "20px", padding: "8px 20px", fontWeight: "bold"}} onClick={handleArchive}>{Archive ? "Unarchive" : "Archive"}</button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'picture' && (
                    <div className="row">
                        <div className="col">
                            <h3>Class Picture</h3>
                            <br/>
                            <div className="row">
                                <div className="col-md-5">
                                    <h6 className="text-muted mb-3">Card Preview</h6>
                                    <div className="card" style={{width: '300px', overflow: 'hidden', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', opacity: Archive ? 0.5 : 1}}>
                                        <div style={{ width: '100%', height: '190px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                                            <Shimmer isLoading={loading}><img className="card-img-top w-100 d-block" src={pictureFile ? URL.createObjectURL(pictureFile) : ((displayClassData.Thumbnail && displayClassData.Thumbnail !== "null") ? `${host}/Thumbnail/` + displayClassData.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png")} style={{ width: '100%', height: '100%', objectFit: 'contain', borderTopLeftRadius: '12px', borderTopRightRadius: '12px'}} alt="..."/></Shimmer>
                                        </div>
                                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h5 className="card-title fw-bold text-dark" style={{ marginBottom: '8px', flex: 1, minWidth: 0 }}>
                                                    {className || "Class Name"}
                                                    {Archive && <span className="badge bg-secondary ms-2 align-text-top" style={{fontSize: '0.7rem', fontWeight: '500'}}>Archived</span>}
                                                </h5>
                                                <button className="btn btn-link p-0 text-muted" type="button" style={{ fontSize: '1.2rem', textDecoration: 'none', cursor: 'default' }}>
                                                    <ThreeDotsVertical />
                                                </button>
                                            </div>
                                            <p className="card-text text-muted" style={{ marginBottom: '0', marginTop: '15px', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                                <i className="bi bi-hash me-1"></i>{classID || "Class ID"}
                                                <span className="badge bg-light text-secondary border ms-auto px-2 py-1" style={{ fontWeight: '500' }}>{schoolYear || "Year"}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <br/>
                                    {(displayClassData.Thumbnail && displayClassData.Thumbnail !== "null") ? (<button type="button" className="btn btn-outline-dark" style={{width: "auto", textAlign: "Left", marginTop: "0.4em", borderRadius: "20px", padding: "8px 20px", fontWeight: "bold"}} onClick={() => {downfile()}}><Download /> Download Current Thumbnail</button>) : (<i/>)}
                                </div>
                                <div className="col">
                                    <h6 className="text-muted mb-3">Upload New Picture</h6>
                                    <div 
                                        className="p-5 text-center" 
                                        style={{ 
                                            border: isDraggingPic ? '2px dashed #0d6efd' : (pictureFile ? '2px solid #0d6efd' : '2px dashed #adb5bd'),
                                            borderRadius: '16px',
                                            cursor: 'pointer', 
                                            backgroundColor: isDraggingPic ? '#e9ecef' : (pictureFile ? '#f8fbff' : '#ffffff'), 
                                            transition: 'all 0.3s ease',
                                            boxShadow: isDraggingPic ? '0 8px 24px rgba(13, 110, 253, 0.15)' : 'none'
                                        }}
                                        onDragOver={onDragOverPic}
                                        onDragLeave={onDragLeavePic}
                                        onDrop={onDropPicture}
                                        onClick={() => document.getElementById('inputGroupFile01').click()}
                                    >
                                        <input type="file" id="inputGroupFile01" style={{ display: 'none' }} accept="image/*" onChange={(e) => { if(e.target.files && e.target.files[0]) setPictureFile(e.target.files[0]) }} />
                                        {pictureFile ? (
                                            <div>
                                                <i className="bi bi-file-image text-primary" style={{ fontSize: '3.5rem' }}></i>
                                                <p className="mt-3 mb-0 fw-bold text-dark fs-5">{pictureFile.name}</p>
                                                <small className="text-primary mt-1 d-block">Click or drag to replace</small>
                                            </div>
                                        ) : (
                                            <div>
                                                <i className={`bi bi-cloud-arrow-up ${isDraggingPic ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '3.5rem', transition: 'color 0.3s ease' }}></i>
                                                <p className={`mt-3 mb-0 fs-5 ${isDraggingPic ? 'text-primary fw-bold' : 'text-dark fw-semibold'}`}>
                                                    {isDraggingPic ? 'Drop image here...' : 'Drag & drop an image here'}
                                                </p>
                                                <small className="text-muted mt-1 d-block">or click to browse from your computer</small>
                                            </div>
                                        )}
                                    </div>
                                    <br/>
                                    <div className="row mt-2">
                                        <div className="col">
                                            {timestamps[0] && <p className="card-text text-muted">Last Submitted: <span>{timestamps[0]}</span></p>}
                                        </div>
                                        <div className="col-md-3">
                                            <button className="btn float-end w-100 fw-bold" style={{ backgroundColor: "#e25595", color: "white", border: "none", borderRadius: "20px", padding: "8px 20px" }} type="button" onClick={() => handleUpload(0)}>Upload</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'student' && (
                    <div className="row">
                        <div className="col">
                            <h3>Student List</h3>
                            <br/>
                            <div className="row">
                                <div className="col">
                                    <div 
                                        className="p-5 text-center" 
                                        style={{ 
                                            border: isDraggingStu ? '2px dashed #198754' : (studentFile ? '2px solid #198754' : '2px dashed #adb5bd'),
                                            borderRadius: '16px',
                                            cursor: 'pointer', 
                                            backgroundColor: isDraggingStu ? '#e8f5e9' : (studentFile ? '#f0fdf4' : '#ffffff'), 
                                            transition: 'all 0.3s ease',
                                            boxShadow: isDraggingStu ? '0 8px 24px rgba(25, 135, 84, 0.15)' : 'none'
                                        }}
                                        onDragOver={onDragOverStu}
                                        onDragLeave={onDragLeaveStu}
                                        onDrop={onDropStudent}
                                        onClick={() => document.getElementById('inputGroupFile02').click()}
                                    >
                                        <input type="file" id="inputGroupFile02" accept=".csv" style={{ display: 'none' }} onChange={(e) => { if(e.target.files && e.target.files[0]) setStudentFile(e.target.files[0]) }} />
                                        {studentFile ? (
                                            <div>
                                                <i className="bi bi-file-earmark-spreadsheet text-success" style={{ fontSize: '3.5rem' }}></i>
                                                <p className="mt-3 mb-0 fw-bold text-dark fs-5">{studentFile.name}</p>
                                                <small className="text-success mt-1 d-block">Click or drag to replace</small>
                                            </div>
                                        ) : (
                                            <div>
                                                <i className={`bi bi-cloud-arrow-up ${isDraggingStu ? 'text-success' : 'text-secondary'}`} style={{ fontSize: '3.5rem', transition: 'color 0.3s ease' }}></i>
                                                <p className={`mt-3 mb-0 fs-5 ${isDraggingStu ? 'text-success fw-bold' : 'text-dark fw-semibold'}`}>
                                                    {isDraggingStu ? 'Drop CSV here...' : 'Drag & drop CSV file here'}
                                                </p>
                                                <small className="text-muted mt-1 d-block">or click to browse from your computer</small>
                                            </div>
                                        )}
                                    </div>
                                    <br/>
                                    <div className="row mt-2">
                                        <div className="col">
                                            {timestamps[1] && <p className="card-text text-muted">Last Submitted: <span>{timestamps[1]}</span></p>}
                                        </div>
                                        <div className="col-md-4">
                                            <button className="btn float-end fw-bold" style={{ backgroundColor: "#e25595", color: "white", border: "none", borderRadius: "20px", padding: "8px 20px" }} type="button" onClick={() => handleUpload(1)}>Upload</button>
                                            <button className="btn btn-outline-secondary float-end fw-bold" type="button" style={{marginRight: "10px", borderRadius: "20px", padding: "8px 20px"}} onClick={handleGenTemplate}>Template</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'secgrp' && (
                    <div className="row mt-4">
                        <div className="col-md-6 border-end pe-4">
                            <h3>Sections</h3>
                            <div className="d-flex mb-3 mt-3">
                                <input type="text" className="form-control me-2" placeholder="New Section Name" value={newSection} onChange={(e) => setNewSection(e.target.value)} style={{ borderRadius: "20px" }} />
                                <button className="btn fw-bold" style={{ backgroundColor: "#e25595", color: "white", border: "none", borderRadius: "20px", padding: "8px 20px" }} onClick={handleCreateSection}>Add</button>
                            </div>
                            <ul className="list-group">
                                {sections.map((secObj, idx) => {
                                    const sec = secObj.name;
                                    const count = secObj.count;
                                    return (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>
                                            {sec || "(Empty)"}
                                            <span className="badge bg-secondary ms-2 rounded-pill">{count} <i className="bi bi-person-fill"></i></span>
                                        </span>
                                        <div>
                                            <button className="btn btn-sm btn-outline-warning me-2 fw-bold" style={{ borderRadius: "20px", padding: "4px 12px" }} onClick={() => {
                                                setModalConfig({
                                                    show: true,
                                                    title: 'Edit Section',
                                                    message: 'Enter new section name:',
                                                    type: 'prompt',
                                                    inputValue: sec,
                                                    confirmText: 'Save',
                                                    confirmColor: 'primary',
                                                    onConfirm: async (newName) => {
                                                        closeCustomModal();
                                                        if (newName !== undefined && newName !== sec) {
                                                            try {
                                                                const res = await fetch(`${host}/TA/class/classes/section`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": Cookies.get("csrf_token") }, body: JSON.stringify({ CSYID, OldSection: sec, NewSection: newName }) });
                                                                const data = await res.json();
                                                                if(data.success) refreshSecGrp(); else Swal.fire('Error', data.msg, 'error');
                                                            } catch (err) { console.error(err); }
                                                        }
                                                    }
                                                });
                                            }}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger fw-bold" style={{ borderRadius: "20px", padding: "4px 12px" }} onClick={() => handleDeleteSection(sec)}>Delete</button>
                                        </div>
                                    </li>
                                )})}
                            </ul>
                            {sections.length === 0 && <p className="text-muted mt-2">No sections found.</p>}
                        </div>
                        <div className="col-md-6 ps-4">
                            <h3>Groups</h3>
                            <div className="d-flex mb-3 mt-3">
                                <input type="text" className="form-control me-2" placeholder="New Group Name" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} style={{ borderRadius: "20px" }} />
                                <button className="btn fw-bold" style={{ backgroundColor: "#e25595", color: "white", border: "none", borderRadius: "20px", padding: "8px 20px" }} onClick={handleCreateGroup}>Add</button>
                            </div>
                            <ul className="list-group">
                                {groups.map((grpObj, idx) => {
                                    const grp = grpObj.name;
                                    const count = grpObj.count;
                                    return (
                                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>
                                            {grp || "(Empty)"}
                                            <span className="badge bg-secondary ms-2 rounded-pill">{count} <i className="bi bi-person-fill"></i></span>
                                        </span>
                                        <div>
                                            <button className="btn btn-sm btn-outline-warning me-2 fw-bold" style={{ borderRadius: "20px", padding: "4px 12px" }} onClick={() => {
                                                setModalConfig({
                                                    show: true,
                                                    title: 'Edit Group',
                                                    message: 'Enter new group name:',
                                                    type: 'prompt',
                                                    inputValue: grp,
                                                    confirmText: 'Save',
                                                    confirmColor: 'primary',
                                                    onConfirm: async (newName) => {
                                                        closeCustomModal();
                                                        if (newName !== undefined && newName !== grp) {
                                                            try {
                                                                const res = await fetch(`${host}/TA/class/classes/group`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": Cookies.get("csrf_token") }, body: JSON.stringify({ CSYID, OldGroup: grp, NewGroup: newName }) });
                                                                const data = await res.json();
                                                                if(data.success) refreshSecGrp(); else Swal.fire('Error', data.msg, 'error');
                                                            } catch (err) { console.error(err); }
                                                        }
                                                    }
                                                });
                                            }}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger fw-bold" style={{ borderRadius: "20px", padding: "4px 12px" }} onClick={() => handleDeleteGroup(grp)}>Delete</button>
                                        </div>
                                    </li>
                                )})}
                            </ul>
                            {groups.length === 0 && <p className="text-muted mt-2">No groups found.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
        <CustomModal 
            show={modalConfig.show} 
            title={modalConfig.title}
            message={modalConfig.message}
            type={modalConfig.type}
            inputValue={modalConfig.inputValue}
            onInputChange={(val) => setModalConfig(prev => ({ ...prev, inputValue: val }))}
            onClose={closeCustomModal}
            onConfirm={modalConfig.onConfirm}
            confirmText={modalConfig.confirmText}
            confirmColor={modalConfig.confirmColor}
        />
    </div>
  )
}


export default ClassEdit
