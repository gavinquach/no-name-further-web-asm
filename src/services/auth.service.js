import axios from "axios";

const API_URL = process.env.REACT_APP_NODEJS_URL + "api/auth/";

class AuthService {
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

                return response.data;
            });
    }

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

    viewUsers() {
        return axios.get(API_URL + "view/users");
    }

    viewOneUser(id) {
        return axios.get(API_URL + "view/user/" + id);
    }

    deleteUser(id) {
        return axios.get(API_URL + "delete/user/" + id);
    }

    editUser(id, username, email, phone, location, password, roles) {
        return axios.post(API_URL + "edit/user/" + id, {
            username,
            email,
            phone,
            location,
            password,
            roles
        });
    }

    register(user) {
        return axios.post(API_URL + "signup", user);
    }

    registerWithRoles(username, email, password, roles) {
        return axios.post(API_URL + "signupWithRoles", {
            username,
            email,
            password,
            roles
        });
    }

    // uploadImage(name, size, type, upload_date, data_url, item) {
    //     return axios.post(API_URL + "add/image", {
    //         name,
    //         size,
    //         type,
    //         upload_date,
    //         data_url,
    //         item
    //     });
    // }

    // getImage(imgId) {
    //     return axios.get(API_URL + "view/img/" + imgId);
    // }

    viewAllItems() {
        return axios.get(API_URL + "view/items");
    }

    viewUserItems(userid) {
        return axios.get(API_URL + "view/user/items/" + userid);
    }

    viewOneItem(itemid) {
        return axios.get(API_URL + "view/item/" + itemid);
    }

    // old code (storing image base64 URL on database)
    // createItem(username, itemObj, imgList) {
    //     return axios.post(API_URL + "add/item", {
    //         username, itemObj, imgList
    //     });
    // }

    // editItem(itemid, itemObj, oldImgList, newImgList) {
    //     return axios.post(API_URL + "edit/item/" + itemid, {
    //         itemid, itemObj, oldImgList, newImgList
    //     });
    // }

    createItem(files, config) {
        return axios.post(API_URL + "add/item", files, config);
    }
    editItem(itemid, files, config) {
        return axios.post(API_URL + "edit/item/" + itemid, files, config);
    }

    deleteItem(id) {
        return axios.get(API_URL + "delete/item/" + id);
    }

    editPassword(id, oldpassword, newpassword) {
        return axios.post(API_URL + "user/edit/password/" + id, {
            oldpassword,
            newpassword
        });
    }

    addItemToCart(itemid, userid) {
        return axios.post(API_URL + "addtocart", {
            itemid,
            userid
        });
    }

    deleteItemFromCart(itemid, userid) {
        return axios.post(API_URL + "deletefromcart/" + itemid, {
            userid
        });
    }

    createTransaction(itemid, userid) {
        return axios.post(API_URL + "add/transaction", {
            itemid,
            userid
        });
    }

    deleteTransaction(id) {
        return axios.get(API_URL + "delete/transaction/" + id);
    }

    cancelTransaction(itemid, userid) {
        return axios.post(API_URL + "cancel/transaction", {
            itemid,
            userid
        });
    }

    getTransactionsByBuyer(userid) {
        return axios.get(API_URL + "view/transactions/buyer/" + userid);
    }
    getTransactionsBySeller(userid) {
        return axios.get(API_URL + "view/transactions/seller/" + userid);
    }
    getTransactionsByItem(itemid) {
        return axios.get(API_URL + "view/transactions/item/" + itemid);
    }

    uploadSingleImage(file, config) {
        return axios.post(API_URL + "upload-single", file, config);
    }

    uploadMultipleImages(files, config) {
        return axios.post(API_URL + "upload-multiple", files, config);
    }
}

export default new AuthService();