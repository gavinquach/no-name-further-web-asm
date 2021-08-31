import axios from "axios";
const API_URL = require("./index");

class AuthService {
    logout() {
        localStorage.removeItem("user");
    }

    getCurrentUser() {
        if (localStorage.getItem("user") !== null) {
            return JSON.parse(localStorage.getItem('user'));
        }
    }

    isLoggedIn() {
        if (localStorage.getItem("user") === null) return false;
        else return true;
    }

    // get role array from user
    getRoles() {
        let roles = [];
        if (localStorage.getItem("user") !== null) {
            const user = JSON.parse(localStorage.getItem('user'));
            user.roles.map((role => roles.push(role)));
        }
        return roles;
    }

    // admin has a manage admin role
    hasManageAdminRole() {
        if (!this.isLoggedIn()) return false;
        const user = JSON.parse(localStorage.getItem('user'));
        let roles = [];
        user.roles.map((role => roles.push(role)));

        if (roles.includes("ROLE_ROOT")
            || roles.includes("ROLE_VIEW_ADMIN")
            || roles.includes("ROLE_EDIT_ADMIN")
            || roles.includes("ROLE_CREATE_ADMIN")
            || roles.includes("ROLE_DELETE_ADMIN")) {
            return true;
        }
        return false;
    }

    // admin has a manage user role
    hasManageUserRole() {
        if (!this.isLoggedIn()) return false;
        const user = JSON.parse(localStorage.getItem('user'));
        let roles = [];
        user.roles.map((role => roles.push(role)));

        if (roles.includes("ROLE_ROOT")
            || roles.includes("ROLE_VIEW_USER")
            || roles.includes("ROLE_EDIT_USER")
            || roles.includes("ROLE_CREATE_USER")
            || roles.includes("ROLE_DELETE_USER")) return true;

        return false;
    }

    // check if user has root access
    isRoot() {
        if (!this.isLoggedIn()) return false;
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.roles.includes("ROLE_ROOT")) return true;
        else return false;
    }

    // check if user is admin
    isAdmin() {
        if (!this.isLoggedIn()) return false;
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.roles.includes("ROLE_ROOT")) return true;
        else if (user.roles.includes("ROLE_VIEW_ADMIN")) return true;
        else if (user.roles.includes("ROLE_CREATE_ADMIN")) return true;
        else if (user.roles.includes("ROLE_EDIT_ADMIN")) return true;
        else if (user.roles.includes("ROLE_DELETE_ADMIN")) return true;
        else if (user.roles.includes("ROLE_VIEW_USER")) return true;
        else if (user.roles.includes("ROLE_CREATE_USER")) return true;
        else if (user.roles.includes("ROLE_EDIT_USER")) return true;
        else if (user.roles.includes("ROLE_DELETE_USER")) return true;
        return false;
    }

    // check if user is regular user
    isRegularUser() {
        if (!this.isLoggedIn()) return false;
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.roles.includes("ROLE_ROOT")) {
            return true;
        }
    }

    login(username, password) {
        return axios
            .post(API_URL + "login", {
                username,
                password
            })
            .then(response => {
                if (response.data.accessToken) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }
                // redirect to home page after logging in
                window.location.replace("/");
                return response.data;
            });
    }
}

export default new AuthService();