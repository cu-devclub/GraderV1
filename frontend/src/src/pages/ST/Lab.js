import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect, useCallback} from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { CodeSlash, FileEarmark, Download } from 'react-bootstrap-icons';
// import PinInput from '../../components/pin';

const host = `${process.env.REACT_APP_HOST}`

function Lab() {
  const navigate = useNavigate();
  
  const [ClassInfo, setClassInfo] = useState({})

  const [Email,] = useState(Cookies.get('Email'));
  const [LID,] = useState(sessionStorage.getItem("LID"))
  const [classId,] = useState(sessionStorage.getItem("classId"))

  const [LabInfo, setLabInfo] = useState(null)

  // const [examPin, setExamPin] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${host}/ST/assignment/specific?LID=${LID}`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        }
      });
      const data = await response.json();
      setLabInfo(data.data)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [LID]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${host}/ST/assignment/specific?LID=${LID}`, {
          method: "GET",
          credentials: "include",
          headers: {
              "Content-type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*",
              "X-CSRF-TOKEN": Cookies.get("csrf_token")
          }
        });
        const data = await response.json();
        setLabInfo(data.data)
      } catch (error) {
        console.error('Error fetching data:', error);
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

    fetchData();
    fetchClass();
  }, [LID, classId, Email]);

  const tiketQR = useCallback(async (Type) => {
    try{
      const response = await fetch(`${host}/ST/assignment/ticket?LID=${LID}&CSYID=${classId}&Type=${Type}`, {
        method: 'GET',
        credentials: "include",
        headers: {
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        }
      })
      const Data = await response.json()
      if (Data.success){
        withReactContent(Swal).fire({
            title: Type === 0 ? "Request to leave" : "Request to enter",
            // text: Data['data']['msg'],
            // icon: "success"
            html: `
              <img src="${Data['data']['qr']}">
              <a style="color:rgb(160, 160, 160)">${Data['data']['ID']}</a><br/>
              <a><b>Student ID:</b> ${Email.split("@")[0]}</a>
            `,
            showCloseButton: true,
            showConfirmButton: false,
        }).then(ok => {
          fetchData()
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
  }, [Email, LID, classId, fetchData]);

  useEffect(() => {
    if (LabInfo && !LabInfo.Info.Access && LabInfo.Info.Exam && !LabInfo.Info.Lock) {
      
      withReactContent(Swal).fire({
        title: `Examination pin`,
        html: `
          <center>
        <br/>
        <input id="swal-pin-input" type="text" maxlength="6" class="swal2-input" placeholder="Enter PIN" autocomplete="off" style="text-align:center;"/>
        <br/>
        <a>or</a>
        <br/>
        <br/>
        <button type="button" id="swal-qr-btn" class="btn btn-info" style="color: white;">Enter with QR</button>
        <br/>
          </center>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: true,
        showCloseButton: false,
        reverseButtons: true,
        showCancelButton: true,
        cancelButtonText: "Back",
        confirmButtonText: "Check in",
        didOpen: () => {
          document.getElementById('swal-qr-btn').onclick = () => tiketQR(1);
        },
        preConfirm: () => {
          const pin = document.getElementById('swal-pin-input').value;
          return pin;
        }
      }).then(butClick => {
        if(butClick.isConfirmed){
          const pin = butClick.value;
          fetch(`${process.env.REACT_APP_HOST}/ST/assignment/checkpin`, {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "X-CSRF-TOKEN": Cookies.get("csrf_token")
            },
            body: JSON.stringify({ 
              LID: LID,
              Pin: pin
            })
          })
          .then(response => response.json())
          .then(data => {
        if(data.success){
          window.location.reload()
          return
        }
        withReactContent(Swal).fire({
          title: data.msg,
          icon: "error"
        }).then(butClick => {
          if(butClick){
            window.location.reload()
          }
        })
          })
          return
        }
        if(butClick.isDismissed && butClick.dismiss){
          navigate("/Class")
          return
        }
      })
    }
  }, [LabInfo, LID, navigate, tiketQR]);

  const downfile = async (t, i) => {
      fetch(`${process.env.REACT_APP_HOST}/glob/download`, {
        method: 'POST',
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        },
          body: JSON.stringify({ fileRequest: `${t}_0_${i}`})
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

  const submit = async (QID, i) => {
    try{
      if(document.getElementById(`Q${QID}`).files.length !== 1){
        withReactContent(Swal).fire({
          title: `Select file to submit question ${i}`,
          icon: "warning",
        })
        return;
      }
      withReactContent(Swal).fire({
          title: `Are you sure to submit with\n${document.getElementById(`Q${QID}`).files[0].name}?`,
          icon: "question",
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: `Yes`,
          confirmButtonColor: "rgb(35, 165, 85)",
      }).then(async ok => {
          if(ok.isConfirmed){
            const formData = new FormData()

            formData.append(`file`, document.getElementById(`Q${QID}`).files[0]);
            formData.append('QID', QID);

            const response = await fetch(`${host}/upload/SMT`, {
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
                  title: Data['msg'],
                  text: Data['data']['msg'],
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

  const downall = async () => {
    fetch(`${process.env.REACT_APP_HOST}/ST/assignment/downloadZip`, {
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
              <h5>Assignment</h5>
            </div>
            <div className="col-md-3">
              <button type="button" className="btn btn-primary float-end" style={{marginLeft:"20px"}} onClick={() => navigate("/Class")}>Back</button>
              {LabInfo && LabInfo.Info["Exam"] ? 
                LabInfo.Info["Access"] ? 
                <button type="button" className="btn btn-info float-end" onClick={() => tiketQR(0)}>Request to leave</button> 
                :
                <button type="button" className="btn btn-info float-end" onClick={() => tiketQR(1)}>Request to enter</button>
              :""}
            </div>
          </div>
        </div>
      {LabInfo ? (
        <div className="card-body">
          <div className='row'>
            <div className='col-5'>  
              <div className='card'>
                <div className='card-header'>
                  <h5>Lab: {LabInfo.Info["Lab"]} {LabInfo.Info["Name"]}</h5>
                </div>
                <div className='card-body'>
                  <div className='row'>
                    <div className='col-3'>
                      <span style={{fontWeight:'normal'}}>
                        Published:
                      </span><br/>
                      <span style={{fontWeight:'normal', color: `${(LabInfo.Info["Late"] === true) ? 'red' : 'black'}`}}>
                        Due:
                      </span>
                    </div>
                    <div className='col'>
                      <span style={{fontWeight:'normal'}}>
                        {` ${LabInfo.Info["Publish"]}`}
                      </span><br/>
                      <span style={{fontWeight:'normal', color: `${(LabInfo.Info["Late"] === true) ? 'red' : 'black'}`}}>
                        {` ${LabInfo.Info["Due"]}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <br/>
              {LabInfo.Info["Access"] ? (
              <div className='card'>
                <div className='card-header'>
                  <div className='row'>
                    <div className='col'>
                      <h5><Download /> Download files</h5>
                    </div>
                    <div className='col-4'>
                    <button type="button" className="btn btn-outline-dark" onClick={downall}>Download All</button>
                    </div>
                  </div>
                </div>
                <div className='card-body'>
                  {LabInfo.Question.map((q, i) => {
                    return <button key={`QD${i}`} type="button" className="btn btn-outline-dark" style={{width: "100%", textAlign: "Left", marginBottom: "0.5em"}} onClick={() => {downfile(1, q.QID)}}><span style={{color: "rgb(54, 128, 255)"}}><CodeSlash /></span> <b>Question file:</b> {i+1} {q.Date}</button>
                  })}
                  {LabInfo.AddFile.map((a, i) => {
                    return <button key={`AD${i}`} type="button" className="btn btn-outline-dark" style={{width: "100%", textAlign: "Left", marginBottom: "0.5em"}} onClick={() => {downfile(0, a[0])}}><span style={{color: "rgb(255, 178, 62)"}}><FileEarmark /></span> <b>Essential file:</b> {a[1]}</button>
                  })}
                </div>
              </div>
              ) : ("")}
            </div>
            <div className='col'>
              {LabInfo.Question.map((q, i) => {
                return <div key={`QS${i}`} className='card' style={{marginBottom: "1rem"}}>
                  <div className='card-header'>
                    <div className="row">
                      <div className="col">
                        <h6>Question: {i+1}</h6>
                      </div>
                      <div className="col-md-2">
                        <b>{q.hideScore ? ("-") : (q.Score)}</b>/{q.Max}
                      </div>
                    </div>
                  </div>
                  <div className='card-body'>
                    {LabInfo.Info["Access"] ? (
                    <div className='row'>
                      <div className='col'>
                        <div className="input-group">
                          <input type="file" className="form-control" id={`Q${q.QID}`} aria-describedby={`Q${q.QID}`} aria-label="Upload" />
                        </div>
                      </div>
                      <div className='col-md-2'>
                        <button className="btn btn-primary float-end" type="button" id={`Q${q.QID}`} onClick={() => {submit(q.QID, i+1)}} disabled={LabInfo.Info["Lock"]}>Submit</button>
                      </div>
                    </div>
                    ):("")}
                    <br/>
                    <div className='row'>
                      <div className='col'>
                        <span><b>Submitted:</b> </span>
                        <span style={{fontWeight:'normal', color: `${q.SMT.Late === 1 ? 'red' : 'black'}`}}>
                          {q.SMT.SID === -1 ? 
                            ("-") : (
                              <span>
                                {q.SMT.Filename} <span style={{color: "rgb(91, 91, 91)", fontSize: "0.8rem"}}>{q.SMT.Date}</span>
                                {LabInfo.Info["Access"] ? (<button type="button" className="btn btn-outline-dark" style={{width: "auto", textAlign: "Left", marginLeft: "0.5em"}} onClick={() => {downfile(2, q.SMT.SID)}}><Download /> Download</button>):("")}
                                <br/><span style={{color: "rgb(101, 101, 101)",fontSize: "1 rem"}}>{'('}<b>Original</b>: {q.SMT.OriginalName}{')'}</span>
                              </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-body">
          <div>Loading</div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Lab;
