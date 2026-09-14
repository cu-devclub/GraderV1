import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import PinInput from '../../components/pin';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FileEarmark, Download, Trash, PencilSquare, Plus, Eye, EyeSlash, ArrowLeftCircle, X, Paperclip } from 'react-bootstrap-icons';
import toast from 'react-hot-toast';

const host = `${process.env.REACT_APP_HOST}`

function AssignEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  // Tab state
  const [currentTab, setCurrentTab] = useState(location.state?.tab || 'Detail');

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

  const handleAddQuestion = () => {
    const newId = Question.length > 0 ? Math.max(...Question.map(q => q.id)) + 1 : 1;
    setScores([...Question, { id: newId, score: 1 }]);
    setTotalQNum(Question.length + 1);
  };

  const handleRemoveQuestion = (id) => {
    if (Question.length <= 1) {
      toast.error("You must have at least 1 question.");
      return;
    }
    setScores(Question.filter(q => q.id !== id));
    setTotalQNum(Question.length - 1);
  };

  const handleScoreChange = (id, score) => {
    const updatedScores = Question.map((item) =>
      item.id === id ? { ...item, score } : item
    );
    setScores(updatedScores);
  };

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



  const handleButtonClick = async () => {
    try{
      if(!validateAndFocus()){
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

  const validateAndFocus = () => {
    let invalidTab = null;
    let focusId = null;
    let errorMessage = null;

    if (labName === '') {
      invalidTab = 'Detail';
      focusId = 'labName';
      errorMessage = 'Lab name is required';
    } else if (labNum === '') {
      invalidTab = 'Detail';
      focusId = 'labNum';
      errorMessage = 'Lab number is required';
    } else if (publishDate === '') {
      invalidTab = 'Detail';
      focusId = 'publishDate';
      errorMessage = 'Publish date is required';
    } else if (dueDate === '') {
      invalidTab = 'Detail';
      focusId = 'dueDate';
      errorMessage = 'Due date is required';
    } else if (new Date(publishDate) > new Date(dueDate)) {
      invalidTab = 'Detail';
      focusId = 'dueDate';
      errorMessage = 'Due date must be after publish date';
    } else if (Selected.length === 0) {
      invalidTab = 'Detail';
      focusId = 'section-container';
      errorMessage = 'Please select at least one assigned section/group';
    } else if (isExam && !/^([A-Za-z0-9]){6}$/.test(examPin)) {
      invalidTab = 'Detail';
      focusId = 'examPin-container';
      errorMessage = 'Exam pin must be 6 alphanumeric characters';
    }

    if (invalidTab) {
      toast.error(errorMessage);
      setCurrentTab(invalidTab);
      setTimeout(() => {
        const el = document.getElementById(focusId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (el.focus) {
            el.focus({ preventScroll: true });
          }
          el.style.transition = 'all 0.3s';
          const originalBorder = el.style.border || el.style.boxShadow;
          if (focusId === 'section-container' || focusId === 'examPin-container') {
             el.style.border = '2px solid #ef4444';
             el.style.borderRadius = '8px';
             el.style.padding = '8px';
          } else {
             el.style.boxShadow = '0 0 0 2px #ef4444';
          }
          
          setTimeout(() => {
            if (focusId === 'section-container' || focusId === 'examPin-container') {
              el.style.border = originalBorder;
              el.style.padding = '0';
            } else {
              el.style.boxShadow = originalBorder;
            }
          }, 2000);
        }
      }, 100);
      return false;
    }
    return true;
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
      <style>
        {`
        .upload-dropzone {
          border: 2px dashed #cbd5e1;
          background-color: transparent;
          transition: all 0.2s;
        }
        .upload-dropzone:hover {
          border-color: #94a3b8;
          background-color: #f8fafc;
        }
        .upload-dropzone.has-file {
          border-color: #e25595;
          background-color: #fdf2f8;
        }
        .upload-dropzone.has-file:hover {
          background-color: #fce7f3;
        }
        @media (max-width: 768px) {
          .responsive-container {
            margin-left: 1rem !important;
            margin-right: 1rem !important;
          }
          .responsive-bottom-bar {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          .detail-flex {
            flex-direction: column !important;
          }
          .exam-pin-container {
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid #cbd5e1 !important;
            padding-left: 0 !important;
            padding-top: 2rem !important;
            margin-top: 2rem !important;
          }
          .detail-left-col {
            padding-right: 0 !important;
          }
        }
        .detail-flex {
          display: flex;
          flex-direction: row;
        }
        .exam-pin-container {
          width: 360px;
          border-left: 1px solid #cbd5e1;
          padding-left: 2rem;
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
      <Navbar />
      <br />
      <div className="responsive-container" style={{ marginLeft: '10em', marginRight: '10em', marginTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '38px' }}>
        <div style={{ color: '#e25595', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 'bold' }} onClick={() => navigate("/AssignList")}>
          <ArrowLeftCircle size={18} /> <span style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>Back to assignment</span>
        </div>
        <button type="button" onClick={() => {loadlab()}} style={{ padding: '6px 20px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '30px', fontWeight: '600', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Download size={16} /> Download all question
        </button>
      </div>
      <div className="card responsive-container" style={{ marginLeft: '10em', marginRight: '10em', border: 'none', boxShadow: 'none', paddingBottom: '100px' }}>
        <div style={{ backgroundColor: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #cbd5e1' }}>
            <div className="tab-scroll-container" style={{ display: 'flex', width: '100%' }}>
              <div 
                style={{ padding: '10px 40px', fontWeight: currentTab === 'Detail' ? '600' : 'normal', fontSize: '1.05rem', color: currentTab === 'Detail' ? '#1e293b' : '#64748b', borderBottom: currentTab === 'Detail' ? '2px solid #e25595' : 'none', cursor: 'pointer', marginBottom: '-1px' }}
                onClick={() => setCurrentTab('Detail')}
              >
                Detail
              </div>
              <div 
                style={{ padding: '10px 40px', fontWeight: currentTab === 'Questions' ? '600' : 'normal', fontSize: '1.05rem', color: currentTab === 'Questions' ? '#1e293b' : '#64748b', borderBottom: currentTab === 'Questions' ? '2px solid #e25595' : 'none', cursor: 'pointer', marginBottom: '-1px' }}
                onClick={() => setCurrentTab('Questions')}
              >
                Questions
              </div>
              <div 
                style={{ padding: '10px 40px', fontWeight: currentTab === 'Files' ? '600' : 'normal', fontSize: '1.05rem', color: currentTab === 'Files' ? '#1e293b' : '#64748b', borderBottom: currentTab === 'Files' ? '2px solid #e25595' : 'none', cursor: 'pointer', marginBottom: '-1px' }}
                onClick={() => setCurrentTab('Files')}
              >
                Additional Files
              </div>
              <div style={{ padding: '10px 40px', fontSize: '1.05rem', color: '#64748b', cursor: 'pointer', marginBottom: '-1px' }} onClick={() =>{sessionStorage.setItem("LID", LID);sessionStorage.setItem("classId", classId);navigate("/Sentin")}}>
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
        
        <div style={{ display: currentTab === 'Detail' ? 'block' : 'none' }}>
        <div className="card" style={{ marginTop: '2rem', borderRadius: '8px', border: '1px solid #cbd5e1', borderTop: `8px solid ${isExam ? '#2b3a67' : '#e25595'}`, overflow: 'hidden' }}>
          <div className="card-body" style={{ padding: '2rem 3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#475569', fontWeight: '600', fontSize: '1rem', marginBottom: '8px' }}>Lab name</div>
                <input 
                  id="labName"
                  type="text" 
                  value={labName} 
                  onChange={(e) => setLabName(e.target.value)} 
                  placeholder="Enter lab name"
                  style={{ border: 'none', fontSize: '2.5rem', fontWeight: 'bold', width: '100%', outline: 'none', color: '#1e293b', padding: '0', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', borderRadius: '30px', border: '1px solid #cbd5e1', overflow: 'hidden', padding: '4px', gap: '4px' }}>
                <button type="button" onClick={() => setIsExam(false)} style={{ flex: 1, padding: '6px 16px', border: 'none', backgroundColor: !isExam ? '#e25595' : 'transparent', color: !isExam ? 'white' : '#64748b', borderRadius: '30px', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>Lab mode</button>
                <button type="button" onClick={() => setIsExam(true)} style={{ flex: 1, padding: '6px 16px', border: 'none', backgroundColor: isExam ? '#2b3a67' : 'transparent', color: isExam ? 'white' : '#64748b', borderRadius: '30px', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>Exam mode</button>
              </div>
            </div>
            
            <hr style={{ borderColor: '#cbd5e1', margin: '2rem -3rem', opacity: 1 }} />
            <div className="detail-flex">
              <div className="detail-left-col" style={{ flex: 1, paddingRight: isExam ? '2rem' : '0' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ color: '#475569', fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px' }}>Lab Number</div>
                  <input id="labNum" type="number" min="1" className="form-control" value={labNum} onChange={(e) => setLabNum(e.target.value)} style={{ width: '200px' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ color: '#475569', fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px' }}>Publish Date</div>
                    <input id="publishDate" type="datetime-local" className="form-control" value={publishDate} onChange={handlePublishDateChange} style={{ width: '250px', paddingRight: '10px' }} />
                  </div>
                  <div style={{ color: '#cbd5e1', fontWeight: 'bold', marginTop: '30px' }}>- - -</div>
                  <div>
                    <div style={{ color: '#475569', fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px' }}>Due Date</div>
                    <input id="dueDate" type="datetime-local" className="form-control" value={dueDate} onChange={handleDueDateChange} min={publishDate} style={{ width: '250px', paddingRight: '10px' }} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px', marginLeft: '20px' }}>
                    <div style={{ 
                  width: '40px', 
                  height: '24px', 
                  borderRadius: '12px', 
                  backgroundColor: !dueDateLock ? (isExam ? '#2b3a67' : '#e25595') : '#cbd5e1', 
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }} onClick={() => setDueDateLock(!dueDateLock)}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: !dueDateLock ? '19px' : '3px',
                        transition: 'left 0.2s'
                      }} />
                    </div>
                    <span style={{ color: '#475569', fontWeight: '500' }}>Allow late submission</span>
                  </div>
                </div>

                <div id="section-container" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '12px' }}>
                    <div style={{ color: '#475569', fontWeight: '600', fontSize: '1.1rem' }}>Assigned {(!isGroup) ? "section" : "group"}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'underline', cursor: 'pointer' }} onClick={selectall}>{(Selected.length === 0) ? "Select all" : "Deselect all"}</div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '350px' }}>
                    {SelectList.map((element) => (
                      <div
                        key={element}
                        onClick={() => handleCheckboxChange(element)}
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          border: `1px solid ${Selected.includes(element) ? (isExam ? '#2b3a67' : '#e25595') : '#cbd5e1'}`,
                          backgroundColor: Selected.includes(element) ? (isExam ? '#2b3a67' : '#e25595') : 'white',
                          color: Selected.includes(element) ? 'white' : '#64748b',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {element}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isExam && (
                <div id="examPin-container" className="exam-pin-container">
                  <div style={{ color: '#475569', fontWeight: '700', fontSize: '1.2rem', marginBottom: '12px' }}>Exam pin</div>
                  <div style={{ width: 'fit-content' }}>
                    <div style={{ position: 'relative' }}>
                      <PinInput values={examPin} onChangePin={setExamPin} disabled={!isExam} />
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={handleShowPin} 
                      disabled={!isExam}
                      style={{ marginTop: '1rem', width: '100%' }}
                    >
                      Show pin to student
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
        </div>
        
        <div style={{ display: currentTab === 'Files' ? 'block' : 'none' }}>
          <div style={{ marginTop: '2rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#475569', marginBottom: '16px' }}>Additional files</div>
            <div className="upload-dropzone" style={{ position: 'relative', padding: '40px', borderRadius: '8px', textAlign: 'center', height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <input type="file" multiple id="addfiles" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={(e) => { 
                if (e.target.files.length > 0) { 
                  const names = Array.from(e.target.files).map(f => f.name).join(', ');
                  e.target.nextSibling.nextSibling.innerText = names; 
                  e.target.nextSibling.style.color = '#e25595'; 
                  e.target.parentElement.classList.add('has-file'); 
                } else { 
                  e.target.nextSibling.nextSibling.innerText = 'Drag & drop or click to upload'; 
                  e.target.nextSibling.style.color = '#94a3b8'; 
                  e.target.parentElement.classList.remove('has-file'); 
                } 
              }} />
              <Paperclip size={32} style={{ color: '#94a3b8' }} />
              <div style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '12px' }}>Drag & drop or click to upload</div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '16px', marginBottom: '32px' }}>
              <button type="button" onClick={addfile} style={{ padding: '8px 32px', backgroundColor: '#e25595', border: 'none', color: 'white', borderRadius: '30px', fontWeight: '600', transition: 'all 0.2s', fontSize: '1rem', cursor: 'pointer' }}>Upload</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {addfiles.map((item, index) => {
                const [id, name, isVisible] = item;
                return (
                  <div key={`AD${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '24px', padding: '12px 24px', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flexGrow: 1, overflow: 'hidden' }} onClick={() => downfile(0, 0, id)}>
                      <FileEarmark size={18} style={{ color: '#94a3b8' }} />
                      <span style={{ color: '#334155', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); isVisible ? hideFile(id) : showFile(id); }} style={{ background: 'none', border: 'none', color: isVisible ? '#3b82f6' : '#94a3b8', cursor: 'pointer', padding: 0 }}>
                        {isVisible ? <Eye size={20} /> : <EyeSlash size={20} />}
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); delfile(id, name); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </div>

        <div style={{ display: currentTab === 'Questions' ? 'block' : 'none' }}>
          <div style={{ marginTop: '2rem' }}>
            <div style={{ textAlign: 'right', marginBottom: '16px', color: '#475569', fontSize: '1rem' }}>
              <strong>{Question.length}</strong> Questions • <strong>{Question.reduce((sum, q) => sum + (Number(q.score) || 0), 0)}</strong> Total points
            </div>
            {Question.map((scoreItem, index) => (
              <div key={scoreItem.id} className="card" style={{ marginBottom: "2rem", borderTop: '6px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Question No.</div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#334155', marginTop: '4px' }}>{index + 1}.</div>
                    </div>
                    {Question.length > 1 && (
                      <button type="button" onClick={() => handleRemoveQuestion(scoreItem.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0' }}>
                        <X size={32} />
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Score</div>
                    <input 
                      id={`QScore${scoreItem.id}`}
                      type="number"
                      min="1"
                      className="form-control"
                      value={scoreItem.score}
                      onChange={(e) => handleScoreChange(scoreItem.id, e.target.value)}
                      style={{ width: '150px' }}
                    />
                  </div>

                  <div className='row'>
                    <div className='col-md-6' style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>ipynb source*</div>
                        {scoreItem.QID && (
                          <button type="button" onClick={() => downfile(1, 1, scoreItem.QID)} style={{ background: 'none', border: 'none', color: '#e25595', fontSize: '0.85rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Download Current</button>
                        )}
                      </div>
                      <div className="upload-dropzone" style={{ position: 'relative', padding: '30px', borderRadius: '8px', textAlign: 'center', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <input type="file" id={`QSource${scoreItem.id}`} accept=".ipynb" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={(e) => { if (e.target.files.length > 0) { e.target.nextSibling.nextSibling.innerText = e.target.files[0].name; e.target.nextSibling.style.color = '#e25595'; e.target.parentElement.classList.add('has-file'); } else { e.target.nextSibling.nextSibling.innerText = 'Drag & drop or click to upload'; e.target.nextSibling.style.color = '#94a3b8'; e.target.parentElement.classList.remove('has-file'); } }} />
                        <Paperclip size={24} style={{ color: '#94a3b8' }} />
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>Drag & drop or click to upload</div>
                      </div>
                    </div>
                    <div className='col-md-6' style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>ipynb release*</div>
                        {scoreItem.QID && (
                          <button type="button" onClick={() => downfile(1, 0, scoreItem.QID)} style={{ background: 'none', border: 'none', color: '#e25595', fontSize: '0.85rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Download Current</button>
                        )}
                      </div>
                      <div className="upload-dropzone" style={{ position: 'relative', padding: '30px', borderRadius: '8px', textAlign: 'center', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <input type="file" id={`QRelease${scoreItem.id}`} accept=".ipynb" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={(e) => { if (e.target.files.length > 0) { e.target.nextSibling.nextSibling.innerText = e.target.files[0].name; e.target.nextSibling.style.color = '#e25595'; e.target.parentElement.classList.add('has-file'); } else { e.target.nextSibling.nextSibling.innerText = 'Drag & drop or click to upload'; e.target.nextSibling.style.color = '#94a3b8'; e.target.parentElement.classList.remove('has-file'); } }} />
                        <Paperclip size={24} style={{ color: '#94a3b8' }} />
                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>Drag & drop or click to upload</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '3rem 0', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', backgroundColor: '#94a3b8', zIndex: 1 }}></div>
              <button type="button" onClick={handleAddQuestion} style={{ zIndex: 2, backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="responsive-bottom-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #cbd5e1', padding: '16px 10em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Lab {labNum || '-'}</div>
          <div style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 'bold' }}>{labName || 'Untitled'}</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={() => navigate("/AssignList")} style={{ padding: '8px 24px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '30px', fontWeight: '600', transition: 'all 0.2s' }}>Cancel</button>
          <button type="button" onClick={handleButtonDelete} style={{ padding: '8px 24px', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '30px', fontWeight: '600', transition: 'all 0.2s' }}>Delete</button>
          <button type="button" onClick={handleButtonClick} style={{ padding: '8px 32px', backgroundColor: '#e25595', border: 'none', color: 'white', borderRadius: '30px', fontWeight: '600', transition: 'all 0.2s' }}>Save</button>
        </div>
      </div>

    </div>
  );
}

export default AssignEdit;