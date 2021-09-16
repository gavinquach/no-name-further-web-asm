import { axiosTokenHeader } from "./AxiosInstance"
const API_URL = require("./index");

class UserService {
    register(user) {
        return axiosTokenHeader.post(API_URL + "signup", user);
    }

    createAdmin(admin) {
        return axiosTokenHeader.post(API_URL + "admin", admin);
    }

    viewAllUsers(sort, page, limit) {
        const url = `?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "users" + url);
    }

    viewAdmins(sort, page, limit) {
        const url = `?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "users/admin" + url);
    }

    viewUsers(sort, page, limit) {
        const url = `?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "users/user" + url);
    }

    viewAdminsSortedByField(field, sort, page, limit) {
        const url = `?field=${field}&sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "users/admin-sorted-by-field" + url);
    }

    viewUsersSortedByField(field, sort, page, limit) {
        const url = `?field=${field}&sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "users/user-sorted-by-field" + url);
    }

    viewOneUser(id) {
        return axiosTokenHeader.get(API_URL + "user/" + id);
    }

    deleteUser(id) {
        return axiosTokenHeader.delete(API_URL + "user/" + id);
    }

    editUser(id, username, email, phone, location, password) {
        return axiosTokenHeader.put(API_URL + "user/" + id, {
            username,
            email,
            phone,
            location,
            password
        });
    }

    viewOneAdmin(id) {
        return axiosTokenHeader.get(API_URL + "admin/" + id);
    }

    editAdmin(id, username, email, phone, location, password, roles) {
        return axiosTokenHeader.put(API_URL + "admin/" + id, {
            username,
            email,
            phone,
            location,
            password,
            roles
        });
    }

    deleteUser(id) {
        return axiosTokenHeader.delete(API_URL + "admin/" + id);
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

    viewUserItems(userid, sort, page, limit) {
        const url = `${userid}?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "user/items/" + url);
    }

    getUserNotifications(userid, sort, page, limit) {
        const url = `${userid}?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "user/notifications/" + url);
    }

    getUserUnreadNotifications(userid, sort, page, limit) {
        const url = `${userid}?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "user/unreadnotifications/" + url);
    }

    getUserNotificationsByType(userid, type, sort, page, limit) {
        const url = `${userid}/${type}?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "user/notifications/" + url);
    }

    addNotification(data) {
        return axiosTokenHeader.post(API_URL + "user/notification", {
            data
        });
    }

    setReadNotification(notification) {
        return axiosTokenHeader.patch(API_URL + "user/read/notification", notification);
    }

    setReadNotifications(notifications) {
        return axiosTokenHeader.patch(API_URL + "user/read/notifications", {
            notifications
        });
    }

    setUnreadNotifications(notifications) {
        return axiosTokenHeader.patch(API_URL + "user/unread/notifications", {
            notifications
        });
    }

    publicgetUser(username) {
        return axiosTokenHeader.get(API_URL + "public/user/" + username);
    }

    search (keyword) {
        return axiosTokenHeader.get(API_URL + "search/" + keyword);
    }
}

export default new UserService();