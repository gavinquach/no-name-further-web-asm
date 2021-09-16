import axios from "axios";

const getToken = () => {
    try {
        return JSON.parse(localStorage.getItem("token"));
    } catch (err) {
        window.alert("Something went wrong. Please log in again!");
        localStorage.removeItem("token");
        localStorage.removeItem("chatOpened");
        localStorage.removeItem("conversationId");
        window.location.replace("/login");
        return;
    }
}

const authHeaderToken = () => {
    const token = getToken();

    if (token) {
        return { 'x-access-token': token };
    } else {
        return {};
    }
}
const authHeaderFormData = () => {
    const token = getToken();

    if (token) {
        return {
            'x-access-token': token,
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
