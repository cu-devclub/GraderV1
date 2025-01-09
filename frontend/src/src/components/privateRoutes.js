import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import { Outlet, Navigate, useHref } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

function PrivateRoutes() {
    const [Token, setToken] = useState(false);
    const [loading, setLoading] = useState(true);
    const url = useHref()

    useEffect(() => {
        const checkAuth = async () => {
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
                const response = await fetch(`${process.env.REACT_APP_HOST}/glob/auth/checkauth`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "X-CSRF-TOKEN": Cookies.get("csrf_token")
                    }
                });
                if (!response.ok) {
                    setToken(false);
                    return;
                }
                const dt = await response.json();

                if(!dt.success){
                    setToken(false);
                    return;
                }
                const isDev = process.env.REACT_APP_DEV.toLowerCase() === 'true';
                if(!isDev) {
                    Cookies.set('Name', dt['data']['Name']);
                    Cookies.set('Email', dt['data']['Email']);
                    Cookies.set('uid', dt['data']['ID']);
                    Cookies.set('role', dt['data']['Role']);
                }

                setToken(true);
            } catch (error) {
                setToken(false);
            } finally {
                setLoading(false);
                withReactContent(Swal).close()
            }
        };

        checkAuth();
    }, []);

    const remem = () => {
        if(url.includes("/DSC/")){
            sessionStorage.setItem("rememberURL", url)
        }
        return <Navigate to='login' />
    }

    const checkremem = () => {
        const chm = sessionStorage.getItem("rememberURL");
        if(chm){
            sessionStorage.removeItem("rememberURL")
            return <Navigate to={chm} />
        }
        return <Outlet />
    }

    if (loading) {
        return <div></div>;
    }

    return Token ? checkremem() : remem();
}

export default PrivateRoutes;
