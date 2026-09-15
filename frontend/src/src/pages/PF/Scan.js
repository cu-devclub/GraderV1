import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Shimmer from '../../components/Shimmer';

const host = `${process.env.REACT_APP_HOST}`

function QRScan() {
    const navigate = useNavigate();
    const [classId,] = useState(sessionStorage.getItem("classId"));
    const [pause, setPause] = useState(false)

    useEffect(() => {
        document.body.style.backgroundColor = "#171717"
    })

    const handleScan = async (result) => {
        setPause(true)
        try{
            const response = await fetch(`${host}/TA/class/Assign/Exam/scan?CSYID=${classId}&ID=${result[0].rawValue.split("/").pop()}`, {
                method: 'GET',
                credentials: "include",
                headers: {
                    "X-CSRF-TOKEN": Cookies.get("csrf_token")
                }
            })
            const Data = await response.json()
            if (Data.success){
                sessionStorage.setItem("classId", Data.data.CSYID)
                withReactContent(Swal).fire({
                    title: `\nPlease Review these Information`,
                    html: `
                        <div class='row' style="width:100%;">
                            <div class='col-4' style="text-align:left;margin-left:5em;">
                                <b>UID</b><br/>
                                <b>Name</b><br/>
                                <b>Lab</b><br/>
                                <b>Type</b>
                            </div>
                            <div class='col' style="text-align:left">
                                ${Data.data.UID} <br/>
                                ${Data.data.Name} <br/>
                                ${Data.data.Lab} <br/>
                                ${Data.data.Type === 0 ? "Leave" : "Enter"}
                            </div>
                        </div>`,
                    showCloseButton: true,
                    showCancelButton: true,
                    focusConfirm: false,
                    confirmButtonText: `Confirm`,
                    confirmButtonColor: "rgb(35, 165, 85)",
                }).then(async ok => {
                    if(ok.isConfirmed){
                        rqchkio(Data.data)
                    }
                    setPause(false)
                })
            }else{
                withReactContent(Swal).fire({
                    title: Data.msg,
                    icon: Data.data
                })
                setPause(false)
            }
        }catch (error) {
            withReactContent(Swal).fire({
                title: "Please contact admin!",
                text: error,
                icon: "error"
            })
            setPause(false)
        }
    }

    const rqchkio = async (data) => {
        try{
            const response = await fetch(`${host}/TA/class/Assign/Exam/check${data.Type === 0 ? "out":"in"}`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "X-CSRF-TOKEN": Cookies.get("csrf_token")
                },
                body: JSON.stringify({ LID: data.LID, UID: data.UID, CSYID: classId })
            })
            const Data = await response.json()
            if (Data.success){
                withReactContent(Swal).fire({
                    title: "Complete!",
                    icon: "success"
                })
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
        
    return (
        <div className='row'>
            <div className='col' style={{padding: "20px"}}>
                <button type="button" className="btn btn-danger" style={{float: "right", marginRight: "20px"}} onClick={() => navigate("/AssignList")}>Back</button>
            </div>
            <div className='col'>
                <div style={{height: "auto", width: "100vmin"}}>
                    <Scanner onScan={async (result) => handleScan(result)} paused={pause} allowMultiple={true} />
                </div>
            </div>
        </div>
    )
}


export default QRScan
