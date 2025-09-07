import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import PinInput from '../../components/pin';

const host = `${process.env.REACT_APP_HOST}`

function AssignCreate() {
  const navigate = useNavigate();
  const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).replace(', ', 'T')

  // User Data
  const [ClassInfo, setClassInfo] = useState({});
  const [classId,] = useState(sessionStorage.getItem("classId"));

  // Normal field
  const [labNum, setLabNum] = useState('');
  const [labName, setLabName] = useState('');
  const [publishDate, setPublishDate] = useState(currentDate)
  const [dueDate, setDueDate] = useState('')
  const [dueDateLock, setDueDateLock] = useState(false)
  const [showLock, setShowLock] = useState(false)
  const [isExam, setIsExam] = useState(false)

  // Question Sys
  const [totalQNum, setTotalQNum] = useState(1);
  const [Question, setScores] = useState([{id: 1, score: 1}]);

  // Group/Section Sys
  const [isGroup, setIsGroup] = useState(false)
  const [SelectList, setSelectList] = useState([]);
  const [Selected, setSelected] = useState([]);

  const [examPin, setExamPin] = useState("");

  useEffect(() => {
    // Get list of sections
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
        setSelectList(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Get list of groups
    const fetchGroup = async () => {
      try {
        const response = await fetch(`${host}/TA/class/classes/group?CSYID=${classId}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        if(data.length !== 0){
          setSelectList(data);
          setIsGroup(true);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Class card info
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

    const getSelect = async () => {
      await fetchSection();
      await fetchGroup();
    }
 
    getSelect()
    fetchClass();
  }, [classId]);
  
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

  const isFormValid = () => {
    if(isExam && examPin.length !== 6){
      return false
    }
    return (
      true &&
      labNum !== '' &&
      labName !== '' &&
      dueDate !== '' &&
      new Date(publishDate) <= new Date(dueDate) &&
      isAllQHaveFile() &&
      Selected.length !== 0
    );
  };

  const isAllQHaveFile = () => {
    for(let i = 0;i < Question.length;i++){
      if(document.getElementById(`QSource${Question[i].id}`).files.length === 0){
        return false
      }
      if(document.getElementById(`QRelease${Question[i].id}`).files.length === 0){
        return false
      }
    }
    return true
  }
  
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
        title: `Are you sure to create assignment with these infomations?`,
        html: `
          <div class='row' style="width:100%;">
            <div class='col-6' style="text-align:left;">
              Lab number<br/>
              Lab name<br/>
              Publish<br/>
              Due<br/>
              Number of quesitons<br/>
              Assign to
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
          const addFiles = await document.getElementById('inputlink').files
          for(let i=0;i<addFiles.length;i++){
            formData.append(`Add${i}`, addFiles[i])
          }

          for(let i = 0;i < Question.length;i++){
            formData.append(`Source${i}`, document.getElementById(`QSource${Question[i].id}`).files[0])
            formData.append(`Release${i}`, document.getElementById(`QRelease${Question[i].id}`).files[0])
          }
          
          formData.append('LabNum', labNum);
          formData.append('LabName', labName);
          
          formData.append("PubDate", publishDate);
          formData.append("DueDate", dueDate);
          formData.append('LockOnDue', dueDateLock);
          formData.append('ShowOnLock', showLock);
          formData.append('isExam', isExam);
          formData.append('ExamPin', examPin);

          formData.append('CSYID', classId);

          formData.append("IsGroup", isGroup);
          formData.append("Selected", Selected);

          formData.append("QNum", totalQNum);
          formData.append("Question", JSON.stringify(Question))
          
          const response = await fetch(`${host}/TA/class/Assign/Create`, {
            method: 'POST',
            credentials: "include",
            headers: {
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            },
            body: formData,
          })
          const Data = await response.json()

          if (Data.success){
            withReactContent(Swal).fire({
                title: "Assignment created",
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
      })
    }catch (error) {
      withReactContent(Swal).fire({
        title: "Please contact admin!",
        text: error,
        icon: "error"
      })
    }
  };
  
  const handlePublishDateChange = (e) => {
    setPublishDate(e.target.value)
  }

  const handleDueDateChange = (e) => {
    setDueDate(e.target.value)
  }

  const selectall = () => {
    if(Selected.length === 0){
      setSelected(SelectList)
    }else{
      setSelected([])
    }
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
              <h5>Create assignment</h5>
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-primary float-end" style={{marginLeft:"20px"}} id="liveToastBtn" onClick={handleButtonClick}>Submit</button>
              <button type="button" className="btn btn-primary float-end" onClick={() => navigate("/AssignList")}>Back</button>
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
                    <input type="number" min="1" className="form-control" id="LabNum" onChange={(e) => setLabNum(e.target.value)} />
                  </div>
                  <div className="col">
                    <label htmlFor="LabName" className="form-label">Lab Name*</label>
                    <input type="name" className="form-control" id="LabName" onChange={(e) => setLabName(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="col">
                <label htmlFor="inputlink" className="form-label">Additional Files</label>
                <input type="file" className="form-control" id="inputlink" placeholder="Select file" multiple/>
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
                {/* <br/>
                <input id={`isExam`} className="form-check-input" type="checkbox" checked={isExam} onChange={() => {setIsExam(!isExam);}}/>
                <label className="form-check-label" htmlFor="isExam" style={{marginLeft: "0.3rem"}}>Examination mode.</label> */}
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
                        <input type="file" id={`QSource${scoreItem.id}`} className="form-control" accept=".ipynb"/> 
                        <label htmlFor={`QRelease${scoreItem.id}`} className="form-label">ipynb release*</label>
                        <input type="file" id={`QRelease${scoreItem.id}`} className="form-control" accept=".ipynb"/> 
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <br></br>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssignCreate;
