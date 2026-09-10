import Cookies from 'js-cookie';

export const useAuth = async () => {
    const response = await fetch(`${process.env.REACT_APP_HOST}/glob/auth/checkauth`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "X-CSRF-TOKEN": Cookies.get("csrf_token")
        }
    })
    if (!response.ok) {
        return false
    }
    var dt = await response.json();

    Cookies.set('Name', dt['data']['Name'])
    Cookies.set('Email', dt['data']['Email'])
    Cookies.set('uid', dt['data']['ID'])
    Cookies.set('role', dt['data']['Role'])

    return true;
};