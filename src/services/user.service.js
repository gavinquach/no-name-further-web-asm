import { axiosTokenHeader } from "./AxiosInstance"
const API_URL = require("./index");

class UserService {
    register(user) {
        return axiosTokenHeader.post(API_URL + "/signup", user);
    }

    createUserWithRoles(username, email, password, roles) {
        return axiosTokenHeader.post(API_URL + "/user", {
            username,
            email,
            password,
            roles
        });
    }

    viewUsers() {
        return axiosTokenHeader.get(API_URL + "/users");
    }

    viewOneUser(id) {
        return axiosTokenHeader.get(API_URL + "/user/" + id);
    }

    deleteUser(id) {
        return axiosTokenHeader.delete(API_URL + "/user/" + id);
    }

    editUser(id, username, email, phone, location, password, roles) {
        return axiosTokenHeader.put(API_URL + "/user/" + id, {
            username,
            email,
            phone,
            location,
            password,
            roles
        });
    }

    editInfo(id, username, email, phone, location, password) {
        return axiosTokenHeader.patch(API_URL + "/user/edit/" + id, {
            username,
            email,
            phone,
            location,
            password
        });
    }

    editPassword(id, oldpassword, newpassword) {
        return axiosTokenHeader.patch(API_URL + "/user/edit/password/" + id, {
            oldpassword,
            newpassword
        });
    }

    addItemToCart(itemid, userid) {
        return axiosTokenHeader.post(API_URL + "/user/cart", {
            itemid,
            userid
        });
    }

    deleteItemFromCart(userid, itemid) {
        return axiosTokenHeader.put(API_URL + "/user/cart/" + userid, {
            itemid
        });
    }

    viewUserCart(userid) {
        return axiosTokenHeader.post(API_URL + "/user/cart/view", { userid });
    }

    viewUserItems(userid) {
        return axiosTokenHeader.get(API_URL + "/user/items/" + userid);
    }
}

export default new UserService();