import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import Navbar from '../../components/Navbar'
import { useNavigate} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Download, ThreeDotsVertical } from 'react-bootstrap-icons';

const host = `${process.env.REACT_APP_HOST}`


function ClassEdit() {
    const navigate = useNavigate();

    const [CSYID, ] = useState(sessionStorage.getItem("classId"));

    const [classData, setClassData] = useState(null)

    const [classID, setClassID] = useState('');
    const [schoolYear, setSchoolYear] = useState('');
    const [className, setClassName] = useState('');
    const [Archive, setArchive] = useState(sessionStorage.getItem("Archive") === 'true')
    const [activeTab, setActiveTab] = useState('class');

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
      
        fetchClass()
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
        const savebutcondi1 = classID === classData.ClassID && schoolYear === classData.SchoolYear && className === classData.ClassName;
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

  return (
    <div>
        <Navbar></Navbar> 
        <br></br>
        {classData ? (
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
                                <button className="nav-link link" onClick={() => {sessionStorage.setItem("CSYID", classData.classid);navigate("/TAmanage")}} >TA</button>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-primary float-end" type="button" style={{marginLeft:"20px"}} onClick={() => navigate("/")}>Back</button>
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
                                <input type="text" className="form-control" id="inputID" placeholder="ex. 2301233 (7 digits number)" value={classID} onChange={handleClassIDChange} />
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="inputYear" className="form-label">School Year/Semester*</label>
                                <input type="text" className="form-control" id="inputYear" placeholder="ex. 2020/1" value={schoolYear} onChange={handleSchoolYearChange}/>
                            </div>
                            <div className="col-6">
                                <label htmlFor="inputName" className="form-label">Class Name*</label>
                                <input type="text" className="form-control" id="inputClass" placeholder="Name" value={className} onChange={handleClassNameChange}/>
                            </div>
                        </div>
                        <div className="row" style={{marginTop: "10px",marginBottom: "20px"}}>
                            <div className="col">
                                <button type="button" className="btn btn-primary float-end" disabled={isCreateButtonDisabled} onClick={handleEditClick}>Save</button>
                                <button type="button" className="btn btn-outline-danger float-end" style={{marginRight: "10px"}} onClick={handleArchive}>{Archive ? "Unarchive" : "Archive"}</button>
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
                                            <img className="card-img-top w-100 d-block" src={pictureFile ? URL.createObjectURL(pictureFile) : ((classData.Thumbnail && classData.Thumbnail !== "null") ? `${host}/Thumbnail/` + classData.Thumbnail : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png")} style={{ width: '100%', height: '100%', objectFit: 'contain', borderTopLeftRadius: '12px', borderTopRightRadius: '12px'}} alt="..."/>
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
                                    {(classData.Thumbnail && classData.Thumbnail !== "null") ? (<button type="button" className="btn btn-outline-dark" style={{width: "auto", textAlign: "Left", marginTop: "0.4em"}} onClick={() => {downfile()}}><Download /> Download Current Thumbnail</button>) : (<i/>)}
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
                                            <button className="btn btn-primary float-end w-100 fw-bold" style={{ borderRadius: '8px' }} type="button" onClick={() => handleUpload(0)}>Upload</button>
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
                                            <button className="btn btn-primary float-end fw-bold" style={{ borderRadius: '8px' }} type="button" onClick={() => handleUpload(1)}>Upload</button>
                                            <button className="btn btn-outline-secondary float-end fw-bold" type="button" style={{marginRight: "10px", borderRadius: '8px'}} onClick={handleGenTemplate}>Template</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        ) : (
            <div>Loading...</div>
        )}
    </div>
  )
}


export default ClassEdit
