import { axiosTokenHeader } from "./AxiosInstance"
const API_URL = require("./index");

class UserService {
    register(user) {
        return axiosTokenHeader.post(API_URL + "signup", user);
    }

    createUserWithRoles(username, email, password, roles) {
        return axiosTokenHeader.post(API_URL + "user", {
            username,
            email,
            password,
            roles
        });
    }

    viewAllUsers() {
        return axiosTokenHeader.get(API_URL + "users");
    }

    viewAdmins() {
        return axiosTokenHeader.get(API_URL + "users/admin");
    }

    viewUsers() {
        return axiosTokenHeader.get(API_URL + "users/user");
    }

    viewOneUser(id) {
        return axiosTokenHeader.get(API_URL + "user/" + id);
    }

    deleteUser(id) {
        return axiosTokenHeader.delete(API_URL + "user/" + id);
    }

    editUser(id, username, email, phone, location, password, roles) {
        return axiosTokenHeader.put(API_URL + "user/" + id, {
            username,
            email,
            phone,
            location,
            password,
            roles
        });
    }

    editInfo(id, username, email, phone, location, password) {
        return axiosTokenHeader.patch(API_URL + "user/edit/" + id, {
            username,
            email,
            phone,
            location,
            password
        });
    }

    editPassword(id, oldpassword, newpassword) {
        return axiosTokenHeader.patch(API_URL + "user/edit/password/" + id, {
            oldpassword,
            newpassword
        });
    }

    addItemToCart(itemid, userid) {
        return axiosTokenHeader.post(API_URL + "user/cart", {
            itemid,
            userid
        });
    }

    deleteItemFromCart(userid, itemid) {
        return axiosTokenHeader.put(API_URL + "user/cart/" + userid, {
            itemid
        });
    }

    viewUserCart(userid) {
        return axiosTokenHeader.post(API_URL + "user/cart/view", { userid });
    }

    viewUserItems(userid) {
        return axiosTokenHeader.get(API_URL + "user/items/" + userid);
    }

    getUserNotifications(userid) {
        return axiosTokenHeader.get(API_URL + "user/notifications/" + userid);
    }

    addNotification(data) {
        return axiosTokenHeader.post(API_URL + "user/notification", {
            data
        });
    }

    setReadNotification(sender, receiver, createdAt) {
        return axiosTokenHeader.patch(API_URL + "user/read/notification", {
            sender,
            receiver,
            createdAt
        });
    }

    setReadNotifications(notifications) {
        return axiosTokenHeader.patch(API_URL + "user/read/notifications", {
            notifications
        });
    }
}

export default new UserService();