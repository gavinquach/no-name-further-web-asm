import axios from "axios";
import AuthService from './auth.service';

const authHeaderToken = () => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (err) {
        // console.log(err);
        AuthService.logout();
        window.alert("Something went wrong. Please log in again!");
        window.location.replace("/login");
        return;
    }

    if (user && user.accessToken) {
        return { 'x-access-token': user.accessToken };
    } else {
        return {};
    }
}
const authHeaderFormData = () => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (err) {
        // console.log(err);
        AuthService.logout();
        window.alert("Something went wrong. Please log in again!");
        window.location.replace("/login");
        return;
    }

    if (user && user.accessToken) {
        return {
            'x-access-token': user.accessToken,
            'Content-type': 'multipart/form-data'
        };
    } else {
        return {};
    }
}

const timeOut = 5000;  // server response wait time, set to 5 seconds

export const axiosTokenHeader = axios.create({
    timeout: timeOut,
    headers: authHeaderToken()
});

export const axiosFormData = axios.create({
    timeout: timeOut,
    headers: authHeaderFormData()
});
