import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content';

import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

function PublicRoutes() {
    const [Token, setToken] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {

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
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <Outlet />;
    }

    return Token ? <Navigate to='/' /> : <Outlet />
}

export default PublicRoutes