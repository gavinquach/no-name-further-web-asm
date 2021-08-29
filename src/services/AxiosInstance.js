import axios from "axios";

const timeOut = 5000;  // server response wait time, set to 5 seconds

const authHeaderToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.accessToken) {
        return { 'x-access-token': user.accessToken };
    } else {
        return {};
    }
}
const authHeaderFormData = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.accessToken) {
        return {
            'x-access-token': user.accessToken,
            'Content-type': 'multipart/form-data'
        };
    } else {
        return {};
    }
}

export const axiosTokenHeader = axios.create({
    timeout: timeOut,
    headers: authHeaderToken()
});

export const axiosFormData = axios.create({
    timeout: timeOut,
    headers: authHeaderFormData()
});
