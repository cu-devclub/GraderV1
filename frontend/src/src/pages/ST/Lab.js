import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import React, { useState, useEffect, useCallback} from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { CodeSlash, FileEarmark, Download } from 'react-bootstrap-icons';
import Shimmer from '../../components/Shimmer';
// import PinInput from '../../components/pin';

const host = `${process.env.REACT_APP_HOST}`;
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
function Lab() {
  const navigate = useNavigate();
  
  const [ClassInfo, setClassInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const displayClassInfo = loading ? { ClassID: '0000000', ClassName: 'Loading Class Name...', ClassYear: '2024/1', Thumbnail: 'null' } : ClassInfo;

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

    Promise.all([fetchData(), fetchClass()]).finally(() => setLoading(false));
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
        const ticketID = Data['data']['ID'];
        let pollInterval;
        withReactContent(Swal).fire({
            title: Type === 0 ? "Request to leave" : "Request to enter",
            // text: Data['data']['msg'],
            // icon: "success"
            html: `
              <img src="${Data['data']['qr']}">
              <a style="color:rgb(160, 160, 160)">${Data['data']['ID']}</a><br/>
              <a><b>Student ID:</b> ${Email.split("@")[0]}</a><br/><br/>
              <small class="text-muted">Checking status in <span id="swal-countdown">3</span> seconds</small>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            didOpen: () => {
              let countdown = 3;
              pollInterval = setInterval(async () => {
                countdown--;
                const countdownEl = document.getElementById('swal-countdown');
                if (countdownEl) {
                  countdownEl.innerText = countdown;
                }
                
                if (countdown <= 0) {
                  countdown = 3; // reset countdown right away
                  if (countdownEl) countdownEl.innerText = countdown;
                  
                  try {
                    const statusRes = await fetch(`${host}/ST/assignment/ticketstatus?ID=${ticketID}`, {
                      method: 'GET',
                      credentials: "include",
                      headers: {
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                      }
                    });
                    const statusData = await statusRes.json();
                    if (statusData.success && statusData.data.confirmed) {
                      Swal.close();
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }
              }, 1000);
            },
            willClose: () => {
              if (pollInterval) {
                clearInterval(pollInterval);
              }
            }
        }).then(ok => {
          fetchData()
          window.location.reload();
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
      let isActionTriggered = false;

      const submitPin = (pin) => {
        if (!pin || pin.length !== 6) return;
        isActionTriggered = true;
        const confirmBtn = document.getElementById('swal-checkin-btn');
        if (confirmBtn) {
          confirmBtn.disabled = true;
          confirmBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style="width: 16px; height: 16px; border-width: 2px;"></span>
            Checking...
          `;
        }
        for (let i = 0; i < 6; i++) {
          const el = document.getElementById(`swal-pin-${i}`);
          if (el) el.disabled = true;
        }

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
          if (data.success) {
            window.location.reload();
            return;
          }
          withReactContent(Swal).fire({
            title: data.msg,
            icon: "error"
          }).then(butClick => {
            if (butClick) {
              window.location.reload();
            }
          });
        })
        .catch(error => {
          console.error('Checkin error:', error);
          withReactContent(Swal).fire({
            title: "Network error",
            text: "Failed to connect to server.",
            icon: "error"
          });
        });
      };

      withReactContent(Swal).fire({
        title: `Examination pin`,
        html: `
          <div class="pt-2">
            <div class="d-flex justify-content-center gap-2 mb-3">
              <input id="swal-pin-0" type="text" maxlength="1" class="form-control text-center exam-pin-box" autocomplete="off" />
              <input id="swal-pin-1" type="text" maxlength="1" class="form-control text-center exam-pin-box" autocomplete="off" />
              <input id="swal-pin-2" type="text" maxlength="1" class="form-control text-center exam-pin-box" autocomplete="off" />
              <input id="swal-pin-3" type="text" maxlength="1" class="form-control text-center exam-pin-box" autocomplete="off" />
              <input id="swal-pin-4" type="text" maxlength="1" class="form-control text-center exam-pin-box" autocomplete="off" />
              <input id="swal-pin-5" type="text" maxlength="1" class="form-control text-center exam-pin-box" autocomplete="off" />
            </div>

            <button type="button" id="swal-checkin-btn" class="btn btn-primary w-100 py-2">Check in</button>

            <div class="d-flex align-items-center my-3">
              <div class="flex-grow-1 border-top"></div>
              <span class="px-3 text-muted small">or</span>
              <div class="flex-grow-1 border-top"></div>
            </div>

            <button type="button" id="swal-qr-btn" class="btn btn-outline-dark w-100 py-2">Enter with QR code</button>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: true,
        customClass: {
          popup: 'exam-pin-modal-popup'
        },
        didOpen: () => {
          const getPin = () => {
            let pin = '';
            for (let i = 0; i < 6; i++) {
              const el = document.getElementById(`swal-pin-${i}`);
              if (el) pin += el.value;
            }
            return pin;
          };

          // Setup PIN inputs
          for (let i = 0; i < 6; i++) {
            const input = document.getElementById(`swal-pin-${i}`);
            if (!input) continue;

            input.addEventListener('input', (e) => {
              const val = e.target.value;
              if (val.length > 1) {
                e.target.value = val.slice(-1);
              }
              if (e.target.value && i < 5) {
                const nextInput = document.getElementById(`swal-pin-${i + 1}`);
                if (nextInput) nextInput.focus();
              }
              const pin = getPin();
              if (pin.length === 6) {
                submitPin(pin);
              }
            });

            input.addEventListener('keydown', (e) => {
              if (e.key === 'Backspace' || e.key === 'Delete') {
                if (e.target.value === '') {
                  if (i > 0) {
                    const prevInput = document.getElementById(`swal-pin-${i - 1}`);
                    if (prevInput) {
                      prevInput.value = '';
                      prevInput.focus();
                    }
                    e.preventDefault();
                  }
                } else {
                  e.target.value = '';
                  e.preventDefault();
                }
              } else if (e.key === 'ArrowLeft' && i > 0) {
                document.getElementById(`swal-pin-${i - 1}`)?.focus();
              } else if (e.key === 'ArrowRight' && i < 5) {
                document.getElementById(`swal-pin-${i + 1}`)?.focus();
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const pin = getPin();
                if (pin.length === 6) {
                  submitPin(pin);
                } else {
                  input.classList.add('is-invalid');
                  setTimeout(() => input.classList.remove('is-invalid'), 1000);
                }
              }
            });

            input.addEventListener('paste', (e) => {
              e.preventDefault();
              const pastedData = (e.clipboardData || window.clipboardData).getData('text').trim();
              if (!pastedData) return;
              const chars = pastedData.split('').slice(0, 6);
              chars.forEach((char, idx) => {
                const box = document.getElementById(`swal-pin-${idx}`);
                if (box) box.value = char;
              });
              const focusIdx = Math.min(chars.length, 5);
              document.getElementById(`swal-pin-${focusIdx}`)?.focus();
              const pin = getPin();
              if (pin.length === 6) {
                submitPin(pin);
              }
            });
          }

          // Check-in button click
          const checkinBtn = document.getElementById('swal-checkin-btn');
          if (checkinBtn) {
            checkinBtn.onclick = () => {
              const pin = getPin();
              if (pin.length === 6) {
                submitPin(pin);
              } else {
                for (let i = 0; i < 6; i++) {
                  const box = document.getElementById(`swal-pin-${i}`);
                  if (box && !box.value) {
                    box.classList.add('is-invalid');
                    box.focus();
                    setTimeout(() => box.classList.remove('is-invalid'), 1200);
                    break;
                  }
                }
              }
            };
          }

          // QR code button click
          const qrBtn = document.getElementById('swal-qr-btn');
          if (qrBtn) {
            qrBtn.onclick = () => {
              isActionTriggered = true;
              tiketQR(1);
            };
          }

          // Auto-focus first pin box
          setTimeout(() => {
            document.getElementById('swal-pin-0')?.focus();
          }, 100);
        }
      }).then(butClick => {
        if (butClick.isDismissed && butClick.dismiss && !isActionTriggered) {
          navigate("/Class");
          return;
        }
      });
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
      <style>
          {`
          @media (max-width: 768px) {
              .responsive-banner {
                  padding-left: 1rem !important;
                  padding-right: 1rem !important;
              }
          }
          `}
      </style>
      <Navbar />
      <Shimmer isLoading={loading}>
      {displayClassInfo && (
      <div className="responsive-banner" style={{ ...getCourseBannerStyle(displayClassInfo['ClassID'] + displayClassInfo['ClassName']), marginTop: '-30px', paddingTop: 'calc(3rem + 30px)', paddingRight: '10vw', paddingBottom: '3rem', paddingLeft: '10vw', width: '100%', minHeight: '200px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={displayClassInfo['Thumbnail'] && displayClassInfo['Thumbnail'] !== 'null' ? `${host}/Thumbnail/` + displayClassInfo['Thumbnail'] : "https://cdn-icons-png.flaticon.com/512/3643/3643327.png"} alt="course" style={{ width: '80px', height: '80px', borderRadius: '50%', marginRight: '1.5rem', objectFit: 'cover', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
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
