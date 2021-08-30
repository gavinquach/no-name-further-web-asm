import axios from "axios";
const API_URL = require("./index");

class UserService {
    register(user) {
        return axios.post(API_URL + "/signup", user);
    }
    
    createUserWithRoles(username, email, password, roles) {
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

    viewUserCart(userid) {
        return axios.post(API_URL + "/user/cart/view", { userid });
    }
    
    viewUserItems(userid) {
        return axios.get(API_URL + "/user/items/" + userid);
    }
}

export default new UserService();