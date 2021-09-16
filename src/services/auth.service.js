import axios from "axios";
import jwt_decode from "jwt-decode";

class AuthService {
    logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("chatOpened");
        localStorage.removeItem("conversationId");
    }

    isLoggedIn = () => {
        if (localStorage.getItem("token") === null) return false;
        try {
            jwt_decode(localStorage.getItem("token"));
            return true;
        } catch (err) {
            return false;
        }
    }

    getCurrentUser = () => {
        if (!this.isLoggedIn()) return false;
        const token = jwt_decode(localStorage.getItem("token"));
        const user = {
            id: token.id,
            username: token.username,
            email: token.email,
            phone: token.phone,
            location: token.location,
            roles: token.roles
        };
        return user;
    }

    // get role array from user
    getRoles = () => {
        if (!this.isLoggedIn()) return false;
        const token = jwt_decode(localStorage.getItem("token"));
        const roles = [];
        token.roles.map((role => roles.push("ROLE_" + role.toUpperCase())));
        return roles;
    }

    // admin has a manage admin role
    hasManageAdminRole = () => {
        if (!this.isLoggedIn()) return false;
        const token = jwt_decode(localStorage.getItem("token"));
        if (token.roles.includes("root")
            || token.roles.includes("view_admin")
            || token.roles.includes("create_admin")
            || token.roles.includes("edit_admin")
            || token.roles.includes("delete_admin")) {
            return true;
        }
        return false;
    }

    // admin has a manage user role
    hasManageUserRole = () => {
        if (!this.isLoggedIn()) return false;
        const token = jwt_decode(localStorage.getItem("token"));
        if (token.roles.includes("root")
            || token.roles.includes("view_user")
            || token.roles.includes("create_user")
            || token.roles.includes("edit_user")
            || token.roles.includes("delete_user")) {
            return true;
        }
        return false;
    }

    // check if user has root access
    isRoot = () => {
        if (!this.isLoggedIn()) return false;
        const token = jwt_decode(localStorage.getItem("token"));
        if (token.roles.includes("root")) return true;
        return false;
    }

    // check if user is admin
    isAdmin = () => {
        if (!this.isLoggedIn()) return false;
        const token = jwt_decode(localStorage.getItem("token"));
        if (token.roles.includes("root")) return true;
        else if (token.roles.includes("view_admin")) return true;
        else if (token.roles.includes("create_admin")) return true;
        else if (token.roles.includes("edit_admin")) return true;
        else if (token.roles.includes("delete_admin")) return true;
        else if (token.roles.includes("view_user")) return true;
        else if (token.roles.includes("create_user")) return true;
        else if (token.roles.includes("edit_user")) return true;
        else if (token.roles.includes("delete_user")) return true;
        return false;
    }

    // check if user is regular user
    isRegularUser = () => {
        if (!this.isLoggedIn()) return false;
        const token = jwt_decode(localStorage.getItem("token"));
        if (token.roles.includes("user")) return true;
        return false;
    }

    // check if user is root account
    isRootAccount = () => {
        if (!this.isLoggedIn()) return false;
        const token = jwt_decode(localStorage.getItem("token"));
        if (token.username == "root") return true;
        return false;
    }

    login = (username, password) => {
        const API_URL = require("./index");
        return axios
            .post(API_URL + "login", {
                username,
                password
            })
            .then(response => {
                if (response.data) {
                    localStorage.setItem("token", JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    confirmEmail = (email, token) => {
        const API_URL = require("./index");
        return axios.get(`${API_URL}confirm-and-login/${email}/${token}`)
            .then(response => {
                if (response.data) {
                    localStorage.setItem("token", JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    sendVerifyEmail = (username, password) => {
        const API_URL = require("./index");
        return axios
            .post(API_URL + "resend-email", {
                username,
                password
            });
    }
}

export default new AuthService();