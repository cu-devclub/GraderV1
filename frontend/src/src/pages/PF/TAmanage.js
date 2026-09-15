import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Search, X } from 'react-bootstrap-icons';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`

function TAmanage() {
    const navigate = useNavigate();

    const [TAList, setTAList] = useState([]);
    const [AddMail, setAddMail] = useState("");
    const [Keyword, setKeyword] = useState("");
    const [CSYID, ] = useState(sessionStorage.getItem("CSYID"))
    const [ClassCreator, setClassCreator] = useState("")

    const [Email,] = useState(Cookies.get('Email'));

    const fetchTA = async () => {
        try {
            const response = await fetch(`${host}/TA/class/TAList?CSYID=${CSYID}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "X-CSRF-TOKEN": Cookies.get("csrf_token")
                }
              });
            const data = await response.json();
            if(!data['success']){
                console.error('Error fetching data:', data['msg']);
                return
            }
            setTAList(data['data'][0]);
            setClassCreator(data['data'][1]);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const fetchTA = async () => {
            try {
                const response = await fetch(`${host}/TA/class/TAList?CSYID=${CSYID}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    }
                  });
                const data = await response.json();
                if(!data['success']){
                    console.error('Error fetching data:', data['msg']);
                    return
                }
                setTAList(data['data'][0]);
                setClassCreator(data['data'][1]);
            } catch (error) {
              console.error('Error fetching data:', error);
            }
        };

        fetchTA();
    }, [CSYID]);

    const handleAdd = async () => {
        try {
            const response = await fetch(`${host}/TA/class/TAAdd`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "X-CSRF-TOKEN": Cookies.get('csrf_token')
                },
                body: JSON.stringify({
                    "Email": AddMail,
                    "CSYID": CSYID
                })
            });
            const responseData = await response.json();
            if(responseData['success']){
                withReactContent(Swal).fire({
                    title: responseData["msg"],
                    icon: "success"
                })
                fetchTA()
            }else{
                withReactContent(Swal).fire({
                    title: "Error!",
                    text: responseData["msg"],
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

    const handleRemove = async (toRemove) => {
        try {
            const response = await fetch(`${host}/TA/class/TADelete`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "X-CSRF-TOKEN": Cookies.get('csrf_token')
                },
                body: JSON.stringify({
                    "Email": toRemove,
                    "CSYID": CSYID
                })
            });
            const responseData = await response.json();
            if(responseData['success']){
                withReactContent(Swal).fire({
                    title: responseData["msg"],
                    icon: "success"
                })
                fetchTA()
            }else{
                withReactContent(Swal).fire({
                    title: "Error!",
                    text: responseData["msg"],
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

    const handleAddEmailChange = (e) => {
        setAddMail(e.target.value);
    }

    const handleSearchChange = (e) => {
        setKeyword(e.target.value);
    }
        
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
                                    <button className="nav-link link" onClick={() => {navigate("/ClassEdit")}}>Class</button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link link" onClick={() => {navigate("/ClassEdit")}}>Picture</button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link link" onClick={() => {navigate("/ClassEdit")}}>Student</button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link active">TA</button>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-dark float-end" type="button" style={{ borderRadius: "20px", padding: "8px 20px", fontWeight: "bold", border: "none" }} onClick={() => navigate("/")}>Back</button>
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <div className='row'>
                        <div className='col'>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" placeholder="Email of new TA" onChange={handleAddEmailChange} style={{ borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px", paddingLeft: "20px" }}/>
                                <div className="input-group-append">
                                    <button className="btn" type="button" onClick={handleAdd} style={{ backgroundColor: "#e25595", color: "white", border: "none", borderTopRightRadius: "20px", borderBottomRightRadius: "20px", padding: "8px 20px", fontWeight: "bold", zIndex: 0 }}>Add</button>
                                </div>
                            </div>
                        </div>
                        <div className='col'></div>
                        <div className='col'>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control" placeholder='Search...' value={Keyword} onChange={handleSearchChange} style={{ borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px", paddingLeft: "20px" }}/>
                                <div className="input-group-append">
                                    <span className="input-group-text" style={{height: "100%", minHeight: "40px", backgroundColor: "transparent", borderTopLeftRadius: "0", borderBottomLeftRadius: "0", borderTopRightRadius: "20px", borderBottomRightRadius: "20px"}}><Search /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col" className="col-1">#</th>
                                <th scope="col" className="col-3">Email</th>
                                <th scope="col">Name</th>
                                <th scope="col" className="col-1">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TAList.length !== 0 ? (
                                TAList.filter(element => {
                                    if((element[0]+element[1]).toLowerCase().includes(Keyword.toLowerCase()))
                                        return element;
                                    return false
                                }).map((element, index) => (
                                    <tr key={index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{element[0]}</td>
                                        <td>{element[1]}</td>
                                        {
                                            (Email !== element[0] && ClassCreator !== element[0]) ? 
                                                <td><button type="button" className="btn btn-outline-danger btn-sm" style={{ borderRadius: "20px", padding: "2px 10px", fontWeight: "bold" }} onClick={() => handleRemove(element[0])}><X size={20} /></button></td> 
                                                : <td></td>
                                        }
                                        
                                    </tr>
                                ))
                            
                            ) : (
                            <tr>
                                <th scope="row"></th>
                                <td>No data</td>
                                <td></td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}


export default TAmanage
