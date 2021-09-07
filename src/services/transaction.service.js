import { axiosTokenHeader } from "./AxiosInstance"
import AuthService from "./auth.service";
import UserService from "./user.service";
import socket from './socket';
const API_URL = require("./index");

const sendNotification = (transaction, msg) => {
    const sender = {
        id: AuthService.getCurrentUser().id,
        username: AuthService.getCurrentUser().username
    };
    let receiverId = null;
    if (sender.id == transaction.user_seller._id) {
        receiverId = transaction.user_buyer._id
    } else if (sender.id == transaction.user_buyer._id) {
        receiverId = transaction.user_seller._id
    }

    const data = {
        type: "transaction",
        sender: sender.id,
        receiver: receiverId,
        url: `/trade/${transaction._id}`,
        message: msg,
        createdAt: new Date()
    };
    socket.emit("notifyUser", data);
    UserService.addNotification(data);
}

class TransactionService {
    createTransaction(itemid, userid) {
        return axiosTokenHeader.post(API_URL + "transaction", {
            itemid,
            userid
        });
    }

    deleteTransaction(id) {
        return axiosTokenHeader.delete(API_URL + "transaction/" + id);
    }

    cancelTransaction(itemid, userid) {
        return axiosTokenHeader.patch(API_URL + "cancel/transaction", {
            itemid,
            userid
        });
    }

    createTransactionWithNotification(itemid, userid) {
        return axiosTokenHeader.post(API_URL + "transaction", {
            itemid,
            userid
        }).then(
            response => {
                const transaction = response.data.transaction;
                const item = response.data.item;

                const sender = {
                    id: AuthService.getCurrentUser().id,
                    username: AuthService.getCurrentUser().username
                };
                let receiverId = null;
                if (sender.id == transaction.user_seller) {
                    receiverId = transaction.user_buyer;
                } else if (sender.id == transaction.user_buyer) {
                    receiverId = transaction.user_seller;
                }

                const data = {
                    type: "transaction",
                    sender: sender.id,
                    receiver: receiverId,
                    url: `/trade/${transaction._id}`,
                    message: `User <b>${sender.username}</b> has requested to trade with your item <b>${item.name}</b>. Click here for more details.`,
                    createdAt: new Date()
                };
                socket.emit("notifyUser", data);
                UserService.addNotification(data);
                return response;
            },
            error => {
                return error.response;
            }
        );
    }

    deleteTransactionWithNotification(transaction, id) {
        sendNotification(
            transaction,
            `Your transaction <b>${transaction._id}</b> has been deleted. Click here for more details.`
        );
        return axiosTokenHeader.delete(API_URL + "transaction/" + id);
    }

    cancelTransactionWithNotification(transaction) {
        sendNotification(
            transaction,
            `User <b>${AuthService.getCurrentUser().username}</b> has requested for a trade cancellation. Click here for more details.`
        );
        return axiosTokenHeader.patch(API_URL + "cancel/transaction", {
            itemid: transaction.item._id,
            userid: AuthService.getCurrentUser().id
        });
    }

    getTransaction(id) {
        return axiosTokenHeader.get(API_URL + "transaction/" + id);
    }
    getAllTransactions() {
        return axiosTokenHeader.get(API_URL + "transactions");
    }
    getTransactionsByBuyer(userid) {
        return axiosTokenHeader.get(API_URL + "transactions/buyer/" + userid);
    }
    getTransactionsBySeller(userid) {
        return axiosTokenHeader.get(API_URL + "transactions/seller/" + userid);
    }
    getTransactionsByItem(itemid) {
        return axiosTokenHeader.get(API_URL + "transactions/item/" + itemid);
    }
}

export default new TransactionService();