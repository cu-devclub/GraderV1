import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Shimmer from '../../components/Shimmer';

const host = `${process.env.REACT_APP_HOST}`

function DSC(){
    const navigate = useNavigate();
    const {id, } = useParams()
    const [classId,] = useState(sessionStorage.getItem("classId"));

    useEffect(() => {
        document.body.style.backgroundColor = "#171717"
        const run = async (id) => {
            try{
                const response = await fetch(`${host}/TA/class/Assign/Exam/scan?CSYID=${classId}&ID=${id}`, {
                    method: 'GET',
                    credentials: "include",
                    headers: {
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    }
                })
                const Data = await response.json()
                if (Data.success){
                    let CSYID = Data.data.CSYID
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
                            rqchkio(Data.data, CSYID)
                        }else if(ok.dismiss){
                            navigate("/Scan")
                        }
                    })
                }else{
                    navigate("/Scan")
                }
            }catch (error) {
                navigate("/Scan")
            }
        }

        const rqchkio = async (data, CSYID) => {
            try{
                const response = await fetch(`${host}/TA/class/Assign/Exam/check${data.Type === 0 ? "out":"in"}`, {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    },
                    body: JSON.stringify({ LID: data.LID, UID: data.UID, CSYID: CSYID })
                })
                const Data = await response.json()
                if (Data.success){
                    withReactContent(Swal).fire({
                        title: "Complete!",
                        icon: "success"
                    }).then(async ok => {
                        if(ok.isConfirmed || ok.dismiss){
                            navigate("/Scan")
                        }
                    })
                }else{
                    navigate("/Scan")
                }
            }catch (error) {
                navigate("/Scan")
            }
        }

        run(id)
    }, [classId, id, navigate])
    return <div></div>
}

export default DSC