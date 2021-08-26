import axios from "axios";

const API_URL = process.env.REACT_APP_NODEJS_URL + "api/auth";

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
        if (localStorage.getItem("user") !== null) {
            let user = JSON.parse(localStorage.getItem('user'));
            let roles = [];
            user.roles.map((role => roles.push(role)));
            return roles;
        }
    }

    // admin has a manage admin role
    hasManageAdminRole() {
        if (localStorage.getItem("user") !== null) {
            let user = JSON.parse(localStorage.getItem('user'));
            let roles = [];
            user.roles.map((role => roles.push(role)));

            if (roles.includes("ROLE_ROOT")
                || roles.includes("ROLE_VIEW_ADMIN")
                || roles.includes("ROLE_EDIT_ADMIN")
                || roles.includes("ROLE_CREATE_ADMIN")
                || roles.includes("ROLE_DELETE_ADMIN")) return true;
            else return false;
        }
    }

    // admin has a manage user role
    hasManageUserRole() {
        if (localStorage.getItem("user") !== null) {
            let user = JSON.parse(localStorage.getItem('user'));
            let roles = [];
            user.roles.map((role => roles.push(role)));

            if (roles.includes("ROLE_ROOT")
                || roles.includes("ROLE_VIEW_USER")
                || roles.includes("ROLE_EDIT_USER")
                || roles.includes("ROLE_CREATE_USER")
                || roles.includes("ROLE_DELETE_USER")) return true;
            else return false;
        }
    }

    // check if user has root access
    isRoot() {
        if (localStorage.getItem("user") !== null) {
            let user = JSON.parse(localStorage.getItem('user'));
            if (user.roles.includes("ROLE_ROOT")) return true;
            else return false;
        } else {
            return false;
        }
    }

    // check if user is admin
    isAdmin() {
        if (localStorage.getItem("user") !== null) {
            let user = JSON.parse(localStorage.getItem('user'));
            if (user.roles.includes("ROLE_ROOT")) return true;
            else if (user.roles.includes("ROLE_VIEW_ADMIN")) return true;
            else if (user.roles.includes("ROLE_EDIT_ADMIN")) return true;
            else if (user.roles.includes("ROLE_DELETE_ADMIN")) return true;
            else if (user.roles.includes("ROLE_VIEW_USER")) return true;
            else if (user.roles.includes("ROLE_EDIT_USER")) return true;
            else if (user.roles.includes("ROLE_DELETE_USER")) return true;
            else return false;
        } else {
            return false;
        }
    }

    // check if user is regular user
    isRegularUser() {
        if (this.isLoggedIn() && !this.isAdmin()) { return true; }
        else { return false; }
    }
    
    login(username, password) {
        return axios
            .post(API_URL + "/login", {
                username,
                password
            })
            .then(response => {
                if (response.data.accessToken) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }

                return response.data;
            });
    }

    register(user) {
        return axios.post(API_URL + "/signup", user);
    }

    registerWithRoles(username, email, password, roles) {
        return axios.post(API_URL + "/signup-with-roles", {
            username,
            email,
            password,
            roles
        });
    }

    viewUsers() {
        return axios.get(API_URL + "/users");
    }

    viewOneUser(id) {
        return axios.get(API_URL + "/user/" + id);
    }

    deleteUser(id) {
        return axios.delete(API_URL + "/user/" + id);
    }

    editUser(id, username, email, phone, location, password, roles) {
        return axios.put(API_URL + "/user/" + id, {
            username,
            email,
            phone,
            location,
            password,
            roles
        });
    }

    editPassword(id, oldpassword, newpassword) {
        return axios.patch(API_URL + "/user/password/" + id, {
            oldpassword,
            newpassword
        });
    }

    addItemToCart(itemid, userid) {
        return axios.post(API_URL + "/user/cart", {
            itemid,
            userid
        });
    }

    deleteItemFromCart(userid, itemid) {
        return axios.put(API_URL + "/user/cart/" + userid, {
            itemid
        });
    }

    viewUserItems(userid) {
        return axios.get(API_URL + "/user/items/" + userid);
    }

    viewAllItems() {
        return axios.get(API_URL + "/items");
    }
    viewOneItem(itemid) {
        return axios.get(API_URL + "/item/" + itemid);
    }

    createItem(files, config) {
        return axios.post(API_URL + "/item", files, config);
    }

    editItem(itemid, files, config) {
        return axios.put(API_URL + "/item/" + itemid, files, config);
    }

    deleteItem(id) {
        return axios.delete(API_URL + "/item/" + id);
    }

    createTransaction(itemid, userid) {
        return axios.post(API_URL + "/transaction", {
            itemid,
            userid
        });
    }

    deleteTransaction(id) {
        return axios.delete(API_URL + "/transaction/" + id);
    }

    cancelTransaction(itemid, userid) {
        return axios.patch(API_URL + "/cancel/transaction", {
            itemid,
            userid
        });
    }

    getAllTransactions() {
        return axios.get(API_URL + "/transactions");
    }
    getTransactionsByBuyer(userid) {
        return axios.get(API_URL + "/transactions/buyer/" + userid);
    }
    getTransactionsBySeller(userid) {
        return axios.get(API_URL + "/transactions/seller/" + userid);
    }
    getTransactionsByItem(itemid) {
        return axios.get(API_URL + "/transactions/item/" + itemid);
    }

    uploadSingleImage(file, config) {
        return axios.post(API_URL + "/upload-single", file, config);
    }
    uploadMultipleImages(files, config) {
        return axios.post(API_URL + "/upload-multiple", files, config);
    }
}

export default new AuthService();