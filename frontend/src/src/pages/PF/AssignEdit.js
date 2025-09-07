import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import PinInput from '../../components/pin';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FileEarmark, Download, Trash, PencilSquare, Plus, Eye, EyeSlash} from 'react-bootstrap-icons';

const host = `${process.env.REACT_APP_HOST}`

function AssignEdit() {
  const navigate = useNavigate();
  // Modal
  const [showModal, setShowModal] = useState(false)
  const [modalEdit, setModalEdit] = useState(false)
  const [curadf, setcuradf] = useState(false)

  // User Data
  const [ClassInfo, setClassInfo] = useState({});
  const [classId,] = useState(sessionStorage.getItem("classId"));
  const [LID,] = useState(sessionStorage.getItem("LID"));

  // Normal field
  const [labNum, setLabNum] = useState('');
  const [labName, setLabName] = useState('');
  const [publishDate, setPublishDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueDateLock, setDueDateLock] = useState(false)
  const [showLock, setShowLock] = useState(false)
  const [isExam, setIsExam] = useState(false)
  const [isExamFromServ, setIsExamFromServ] = useState(false)

  // Question Sys
  const [totalQNum, setTotalQNum] = useState(1);
  const [Question, setScores] = useState([{id: 1, score: 1}]);
  const [addfiles, setAddfiles] = useState([])

  // Group/Section Sys
  const [isGroup, setIsGroup] = useState(false)
  const [SelectList, setSelectList] = useState([]);
  const [Selected, setSelected] = useState([]);

  // exampin
  const [examPin, setExamPin] = useState("");

  const fetchLab = async () => {
    try {
      const response = await fetch(`${host}/TA/class/Assign/data?LID=${LID}`, {
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
        setLabNum(data.data.LabNum)
        setLabName(data.data.LabName)

        setPublishDate(data.data.PubDate)
        setDueDate(data.data.DueDate)
        setDueDateLock(data.data.LOD)
        setShowLock(data.data.ShowOnLock)
        setIsExam(data.data.isExam)
        setIsExamFromServ(data.data.isExam)
        setExamPin(data.data.ExamPin)

        setIsGroup(data.data.IsGroup)
        setSelectList(data.data.SelectList)
        setSelected(data.data.Selected)

        setTotalQNum(data.data.Question.length)
        setScores(data.data.Question)
        setAddfiles(data.data.addfile)
      }else{
        throw Error(data.msg)
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const fetchLab = async () => {
      try {
        const response = await fetch(`${host}/TA/class/Assign/data?LID=${LID}`, {
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
          setLabNum(data.data.LabNum)
          setLabName(data.data.LabName)
  
          setPublishDate(data.data.PubDate)
          setDueDate(data.data.DueDate)
          setDueDateLock(data.data.LOD)
          setShowLock(data.data.ShowOnLock)
          setIsExam(data.data.isExam)
          setIsExamFromServ(data.data.isExam)
          setExamPin(data.data.ExamPin)
  
          setIsGroup(data.data.IsGroup)
          setSelectList(data.data.SelectList)
          setSelected(data.data.Selected)
  
          setTotalQNum(data.data.Question.length)
          setScores(data.data.Question)
          setAddfiles(data.data.addfile)
        }else{
          throw Error(data.msg)
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
        // setAssignmentsData(data);
        setClassInfo(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchClass()
    fetchLab()
  }, [classId, LID]);

  useEffect(() => {
    sessionStorage.setItem("isExam", isExamFromServ)
  }, [isExamFromServ])

  const handlePublishDateChange = (e) => {
    setPublishDate(e.target.value)
  }

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value)
  }

  const handleCheckboxChange = (e) => {
    if(Selected.includes(e)){
      setSelected(Selected.filter((item) => item !== e));
    }else{
      setSelected([...Selected, e]);
    }
  };

  const handleTotalQNumChange = (e) => {
    const numQuestions = parseInt(e.target.value, 10);
    setTotalQNum(numQuestions);

    const newScores = Array.from({ length: numQuestions }, (_, index) => ({
      id: index + 1,
      score: 1,
    }));
    setScores(newScores);
  };

  const handleScoreChange = (id, score) => {
    const updatedScores = Question.map((item) =>
      item.id === id ? { ...item, score } : item
    );
    setScores(updatedScores);
  };

  const handleButtonClick = async () => {
    try{
      if(!isFormValid()){
        withReactContent(Swal).fire({
          title: "Please fill required field in form",
          icon: "warning"
        })
        return;
      }
      withReactContent(Swal).fire({
        title: `Are you sure to update assignment with these infomations?`,
        html: `
          <div class='row' style="width:100%;">
            <div class='col-6' style="text-align:left;">
              <b>Lab number</b><br/>
              <b>Lab name</b><br/>
              <b>Publish</b><br/>
              <b>Due</b><br/>
              <b>Number of quesitons</b><br/>
              <b>Assign to</b>
            </div>
            <div class='col' style="text-align:left">
              ${labNum} <br/>
              ${labName} <br/>
              ${publishDate.replace("-", "/").replace("T", " ")} <br/>
              ${dueDate.replace("-", "/").replace("T", " ")} <br/>
              ${totalQNum} <br/>
              ${Selected.toString()}
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
          const formData = new FormData()
          // const addFiles = await document.getElementById('inputlink').files
          // for(let i=0;i<addFiles.length;i++){
          //   formData.append(`Add${i}`, addFiles[i])
          // }

          for(let i = 0;i < Question.length;i++){
            formData.append(`Source${i}`, document.getElementById(`QSource${Question[i].id}`).files[0])
            formData.append(`Release${i}`, document.getElementById(`QRelease${Question[i].id}`).files[0])
          }
          
          formData.append('LID', LID);
          formData.append('LabNum', labNum);
          formData.append('LabName', labName);
          
          formData.append("PubDate", publishDate);
          formData.append("DueDate", dueDate);
          formData.append("LOD", dueDateLock);
          formData.append('ShowOnLock', showLock);
          formData.append('isExam', isExam);
          formData.append('ExamPin', examPin);

          formData.append('CSYID', classId);

          formData.append("IsGroup", isGroup);
          formData.append("Selected", Selected);

          formData.append("QNum", totalQNum);
          formData.append("Question", JSON.stringify(Question))

          
          withReactContent(Swal).fire({
            html: `<div class="pos-center">
                        <div class="loader"></div>
                    </div> `,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            background: "rgba(0, 0, 0, 0)"
          })
          try {
            const response = await fetch(`${host}/TA/class/Assign/Edit`, {
              method: 'POST',
              credentials: "include",
              headers: {
                  "X-CSRF-TOKEN": Cookies.get("csrf_token")
              },
              body: formData,
            })
            const Data = await response.json()
            withReactContent(Swal).close()

            if (Data.success){
              withReactContent(Swal).fire({
                  title: "Assignment edited",
                  icon: "success"
              }).then(ok => {
                  if(ok)
                    window.location.reload()
              });
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
    }catch (error) {
      withReactContent(Swal).fire({
        title: "Please contact admin!",
        text: error,
        icon: "error"
      })
    }
  };

  const isFormValid = () => {
    if (isExam && !/^\d{6}$/.test(examPin)) {
      return false;
    }
    return (
      true &&
      labNum !== '' &&
      labName !== '' &&
      dueDate !== '' &&
      new Date(publishDate) <= new Date(dueDate) &&
      Selected.length !== 0
    );
  };

  const handleButtonDelete = async () => {
    try {
      withReactContent(Swal).fire({
          title: "Are you sure to delete this Assignment?",
          icon: "warning",
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: `Delete`,
          confirmButtonColor: "rgb(217, 39, 39)",
      }).then(async ok => {
          if(ok.isConfirmed){
            const response = await fetch(`${host}/TA/class/Assign/delete`, {
              method: 'POST',
              credentials: "include",
              headers: {
                  "Content-type": "application/json; charset=UTF-8",
                  "Access-Control-Allow-Origin": "*",
                  "X-CSRF-TOKEN": Cookies.get("csrf_token")
              },
              body: JSON.stringify({ LabID: LID }),
            })

            const Data = await response.json()

            if (Data.success){
              withReactContent(Swal).fire({
                  title: "Assignment deleted",
                  icon: "success"
              }).then(ok => {
                  if(ok)
                      window.location.href = "/AssignList"
              });
            }else{
                withReactContent(Swal).fire({
                  title: Data.msg,
                  icon: Data.data
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
  };

  const downfile = async (t, l, i) => {
    fetch(`${process.env.REACT_APP_HOST}/glob/download`, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            "X-CSRF-TOKEN": await Cookies.get("csrf_token")
        },
        body: JSON.stringify({ fileRequest: `${t}_${l}_${i}`})
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

  const selectall = () => {
    if(Selected.length === 0){
      setSelected(SelectList)
    }else{
      setSelected([])
    }
  }


  // Additional files
  const addfilemodal = async () => {
    setModalEdit(false)
    setShowModal(true)
  }

  const addfile = async () => {
    if(document.getElementById(`addfiles`).files.length === 0){
      withReactContent(Swal).fire({
        title: "Please fill required field in form",
        icon: "warning"
      })
      return;
    }

    const formData = new FormData()

    const addFiles = await document.getElementById('addfiles').files
    for(let i=0;i<addFiles.length;i++){
      formData.append(`Add${i}`, addFiles[i])
    }
    
    formData.append('LID', LID);
    formData.append('CSYID', classId);

    try {
      const response = await fetch(`${host}/TA/class/Assign/addfile`, {
        method: 'POST',
        credentials: "include",
        headers: {
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        },
        body: formData,
      })
      const Data = await response.json()
      withReactContent(Swal).close()

      if (Data.success){
        fetchLab()
        withReactContent(Swal).fire({
            title: "Added",
            icon: "success"
        })
        var file = document.getElementById(`addfiles`);
        file.value = file.defaultValue;
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
    setShowModal(false)
  }

  const editfilemodal = async (i) => {
    setcuradf(i)
    setModalEdit(true)
    setShowModal(true)
  }

  const editfile = async () => {
    if(document.getElementById(`editfile`).files.length === 0){
      withReactContent(Swal).fire({
        title: "Please fill required field in form",
        icon: "warning"
      })
      return;
    }

    const formData = new FormData()

    formData.append('Add', document.getElementById(`editfile`).files[0])
    formData.append("ID", curadf)
    formData.append('CSYID', classId);

    try {
      const response = await fetch(`${host}/TA/class/Assign/editfile`, {
        method: 'POST',
        credentials: "include",
        headers: {
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        },
        body: formData,
      })
      const Data = await response.json()
      withReactContent(Swal).close()

      if (Data.success){
        withReactContent(Swal).fire({
            title: "Edited",
            icon: "success"
        });
        var file = document.getElementById(`editfile`);
        file.value = file.defaultValue;
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
    setShowModal(false)
  }

  const handleShowPin = async () => {
    withReactContent(Swal).fire({
      title: `Examination pin`,
      html: `<div style="display:flex;justify-content:center;align-items:center;height:40vh;">
           <h1 style="font-size:8rem;">${examPin}</h1>
         </div>`,
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
      showConfirmButton: true,
      width: '80vw',
      customClass: {
      popup: 'swal2-cover-page'
      }
    })
  }

  const delfile = async (i, name) => {
    withReactContent(Swal).fire({
      title: `Are you sure to delete this additional file?`,
      html: `
        <div class='row' style="width:100%;">
          <div class='col-6' style="text-align:right;">
            <b>Filename:</b>
          </div>
          <div class='col' style="text-align:left">
            ${name}
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
        fetch(`${process.env.REACT_APP_HOST}/TA/class/Assign/delfile`, {
          method: 'POST',
          credentials: "include",
          headers: {
              'Content-Type': 'application/json; charset=UTF-8',
              "X-CSRF-TOKEN": await Cookies.get("csrf_token")
          },
          body: JSON.stringify({ 
            fileRequest: `${i}`,
            CSYID: classId
          })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
              fetchLab()
              withReactContent(Swal).fire({
                title: "Deleted",
                icon: "success"
              })
            }else{
              withReactContent(Swal).fire({
                title: data.msg,
                icon: "error"
              })
            }
        })
        .catch(error => console.error('Error:', error));
      }
    })
  }

  const loadlab = async () => {
    fetch(`${process.env.REACT_APP_HOST}/TA/class/Assign/downloadLabZip`, {
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

  const hideFile = async (i) => {
    fetch(`${process.env.REACT_APP_HOST}/TA/class/Assign/hideaf`, {
      method: 'POST',
      credentials: "include",
      headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          "X-CSRF-TOKEN": await Cookies.get("csrf_token")
      },
      body: JSON.stringify({ 
        fileRequest: `${i}`,
        CSYID: classId
      })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
          fetchLab()
          withReactContent(Swal).fire({
            title: "Updated",
            icon: "success"
          })
        }else{
          withReactContent(Swal).fire({
            title: data.msg,
            icon: "error"
          })
        }
    })
    .catch(error => console.error('Error:', error));
  }

  const showFile = async (i) => {
    fetch(`${process.env.REACT_APP_HOST}/TA/class/Assign/showaf`, {
      method: 'POST',
      credentials: "include",
      headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          "X-CSRF-TOKEN": await Cookies.get("csrf_token")
      },
      body: JSON.stringify({ 
        fileRequest: `${i}`,
        CSYID: classId
      })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success){
          fetchLab()
          withReactContent(Swal).fire({
            title: "Updated",
            icon: "success"
          })
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
      <div className="card" style={{ marginLeft: '10em', marginRight: '10em' }}>
        <div className="card-header">
          <div className="row" style={{marginBottom:"-5px"}}>
              <div className="col">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                      <button className="nav-link active">Edit</button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/Sentin")}} >Sent in</button>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/AssignSus")}} >Suspicious</button>
                  </li>
                  <li className="nav-item">
                    { isExamFromServ ? (<button className="nav-link link" onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/CheckInOut")}} >Check in-out</button>) : ("")}
                  </li>
                </ul>
              </div>
              <div className="col-md-5">
                <button type="button" className="btn btn-danger float-end" style={{marginLeft:"2em"}} id="liveToastBtn" onClick={handleButtonDelete}>Delete</button>
                <button type="button" className="btn btn-primary float-end" style={{marginLeft:"1em"}} id="liveToastBtn" onClick={handleButtonClick}>Save</button>
                <button type="button" className="btn btn-primary float-end" onClick={() => navigate("/AssignList")}>Back</button>
                <button className="btn btn-outline-dark float-end" type="button" onClick={() => {loadlab()}} style={{marginRight: "1em"}}>Download</button>
              </div>
            </div>
          </div>
          <div className="card-body">
          <form className="row g-3">
            <div className="row" style={{marginBottom: "1rem", marginTop: "1rem"}}>
              <div className="col">
                <div className="row">
                  <div className="col">
                    <label htmlFor="LabNum" className="form-label">Lab Number*</label>
                    <input type="number" min="1" className="form-control" id="LabNum" value={labNum} onChange={(e) => setLabNum(e.target.value)} />
                  </div>
                  <div className="col">
                    <label htmlFor="LabName" className="form-label">Lab Name*</label>
                    <input type="name" className="form-control" id="LabName" value={labName} onChange={(e) => setLabName(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="col">
                {/* <label htmlFor="inputlink" className="form-label">Additional Files</label>
                <input type="file" className="form-control" id="inputlink" placeholder="Select file" multiple/> */}
              </div>
            </div>
            <div className="row" style={{marginBottom: "1rem"}}>
              <div className="col">
                <div className='row'>
                  <div className="col-md-6">
                    <label htmlFor={`PublishDate`} className="form-label">Publish Date*</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id={`publishdate`}
                      value={publishDate}
                      onChange={handlePublishDateChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor={`duedate`} className="form-label">Due Date*</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id={`duedate`}
                      value={dueDate}
                      onChange={handleDueDateChange}
                      min={publishDate}
                    />
                    <input id={`duedatelock`} className="form-check-input" type="checkbox" checked={dueDateLock} onChange={() => setDueDateLock(!dueDateLock)}/>
                    <label className="form-check-label" htmlFor="duedatelock" style={{marginLeft: "0.3rem"}}>Close submission on Due date</label>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="inputQnum" className="form-label">Total Question Number*</label>
                <input type="number" min="1" className="form-control" id="inputQnum" value={totalQNum} onChange={handleTotalQNumChange} />
                <input id={`showlock`} className="form-check-input" type="checkbox" checked={showLock} onChange={() => setShowLock(!showLock)}/>
                <label className="form-check-label" htmlFor="showlock" style={{marginLeft: "0.3rem"}}>Show the score only after lab is locked.</label>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div style={{marginLeft: "1rem"}}>
                  <input id={`isExam`} className="form-check-input" type="checkbox" checked={isExam} onChange={() => {setIsExam(!isExam);}}/>
                  <label className="form-check-label" htmlFor="isExam" style={{marginLeft: "0.3rem"}}>Examination mode.</label>
                  <br/><br/>
                  <div className='row'>
                    <div className='col'>
                      <PinInput values={examPin} onChangePin={setExamPin} disabled={!isExam}/>
                    </div>
                    <div className='col'>
                      <button type="button" className="btn btn-primary" onClick={handleShowPin} disabled={!isExam}>Show pin</button>
                    </div>
                  </div>
                  <br/><br/>
                </div>
                <div className="card">
                  <div className='card-header'>
                    <div className='row'>
                      <div className='col'>
                        {(!isGroup) ? "Section" : "Group"}*
                      </div>
                      <div className='col'>
                        <button type="button" className="btn btn-outline-dark float-end" onClick={selectall}>{(Selected.length === 0) ? "S" : "Des"}elect all</button>
                      </div>
                    </div>
                  </div>
                  <div className='card-body'>
                    {SelectList.map((element) => (
                    <div key={element} className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`inlineCheckbox${element}`}
                        value={element}
                        checked={Selected.includes(element)}
                        onChange={() => handleCheckboxChange(element)}
                      />
                      <label className="form-check-label" htmlFor={`inlineCheckbox${element}`}>
                        {element}
                      </label>
                    </div>
                  ))}
                  </div>
                </div>
                <br/>
                <div className='card'>
                  <div className='card-header'>
                    <div className='row'>
                      <div className='col'>
                        <h5><Download /> Files</h5>
                      </div>
                      <div className='col-3'>
                        <button type="button" className="btn btn-outline-success" onClick={addfilemodal}><Plus /> Add</button>
                      </div>
                    </div>
                    
                  </div>
                  <div className='card-body'>
                    {addfiles.map((item, index) => {
                      const [id, name, isVisible] = item;
                      return (
                        <div className="row" key={`AD${index}`}>
                          <div className="col" style={{ paddingRight: "0px" }}>
                            <button
                              type="button"
                              className="btn btn-outline-dark"
                              style={{ width: "100%", textAlign: "Left", marginBottom: "0.5em", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
                              onClick={() => downfile(0, 0, id)}
                              title={name}
                            >
                              <span style={{ color: "rgb(255, 178, 62)" }}>
                                <FileEarmark />
                              </span>
                              Essential file {index + 1}: {name}
                            </button>
                          </div>
                          <div className="col-3" style={{ paddingLeft: "0px" }}>
                            <button
                              type="button"
                              className="btn btn-outline-warning"
                              style={{ width: "auto", textAlign: "Left", marginBottom: "0.5em", marginLeft: "0.5em" }}
                              onClick={() => editfilemodal(id)}
                            >
                              <PencilSquare />
                            </button>
                            <button
                              type="button"
                              className={`btn btn${isVisible ? "-outline" : "" }-secondary`}
                              style={{ width: "auto", textAlign: "Left", marginBottom: "0.5em", marginLeft: "0.5em" }}
                              onClick={() => (isVisible ? hideFile(id) : showFile(id))}
                            >
                              {isVisible ? <Eye /> : <EyeSlash />}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              style={{ width: "auto", textAlign: "Left", marginBottom: "0.5em", marginLeft: "0.5em" }}
                              onClick={() => delfile(id, name)}
                            >
                              <Trash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className='col'>
                <div className="card">
                  <div className='card-header'>
                    Questions*
                  </div>
                  <div className='card-body'>
                    {Question.map((scoreItem) => (
                      <div key={scoreItem.id} className="col" style={{marginBottom: "1rem"}}>
                        <b>Question {scoreItem.id}</b>
                        <br />
                        <label htmlFor={`QScore${scoreItem.id}`} className="form-label">Score</label>
                        <input 
                          id={`QScore${scoreItem.id}`}
                          type="number"
                          min="1"
                          className="form-control"
                          value={scoreItem.score}
                          onChange={(e) => handleScoreChange(scoreItem.id, e.target.value)}
                        />
                        <label htmlFor={`QSource${scoreItem.id}`} className="form-label">ipynb source*</label>
                        <div className='row'>
                          <div className='col'>
                            <input type="file" id={`QSource${scoreItem.id}`} className="form-control" accept=".ipynb"/> 
                          </div>
                          <div className='col-2'>
                            <button type="button" className="btn btn-outline-dark" style={{width: "auto", textAlign: "Left", marginLeft: "0em"}} onClick={() => {downfile(1, 1, scoreItem.QID)}}><Download /></button>
                          </div>
                        </div>

                        <label htmlFor={`QRelease${scoreItem.id}`} className="form-label">ipynb release*</label>
                        <div className='row'>
                          <div className='col'>
                            <input type="file" id={`QRelease${scoreItem.id}`} className="form-control" accept=".ipynb"/> 
                          </div>
                          <div className='col-2'>
                            <button type="button" className="btn btn-outline-dark" style={{width: "auto", textAlign: "Left", marginLeft: "0em"}} onClick={() => {downfile(1, 0, scoreItem.QID)}}><Download /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <br></br>
          </form>
        </div>




        <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" aria-labelledby="addfileModal" aria-hidden="true" style={{ display: showModal ? 'block' : 'none' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><span style={{color: "rgb(255, 178, 62)"}}><FileEarmark /></span> {modalEdit ? "Edit" : "Add"}</h5>
                <button type="button" className="btn-close" onClick={() => {setShowModal(false)}} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                { modalEdit ? (
                  <div>
                    <label htmlFor="inputlink" className="form-label">New file</label>
                    <input type="file" className="form-control" id="editfile" placeholder="Select file"/>
                  </div>
                ):(
                  <div>
                    <label htmlFor="inputlink" className="form-label">Add files</label>
                    <input type="file" className="form-control" id="addfiles" placeholder="Select file(s)" multiple/>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {setShowModal(false)}}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => {modalEdit ? editfile() : addfile()}}>Save</button>
              </div>
            </div>
          </div>
        </div>





      </div>
    </div>
  );
}

export default AssignEdit;