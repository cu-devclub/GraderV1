import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import { Outlet, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePerm } from './usePerm';
import Cookies from 'js-cookie';

const host = `${process.env.REACT_APP_HOST}`;

function ProfRoutes() {
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(true);
    const perm = usePerm();
    const {id, } = useParams();

    useEffect(() => {
        async function checkPermissions() {
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
                const CSYID = sessionStorage.getItem("classId");
                const Email = Cookies.get('Email');

                if (Email && (CSYID || id)) {
                    const response = await fetch(`${host}/glob/auth/checkperm?CSYID=${CSYID}&ID=${id}`,{
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                            "Access-Control-Allow-Origin": "*",
                            "X-CSRF-TOKEN": Cookies.get("csrf_token")
                        }
                    });
                    const data = await response.json();
                    withReactContent(Swal).close()
                    setHasPermission(data.success);
                } else {
                    setHasPermission(false);
                }
            } catch (error) {
                console.error('Error checking permissions:', error);
                setHasPermission(false);
            } finally {
                setLoading(false);
            }
        }

        checkPermissions();
    }, [id]);

    if (loading) {
        return <div></div>;
    }

    return (perm || hasPermission) ? <Outlet /> : <Navigate to='/' />;
}

export default ProfRoutes;
