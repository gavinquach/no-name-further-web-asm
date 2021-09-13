import { axiosTokenHeader } from "./AxiosInstance"
import AuthService from "./auth.service";
import UserService from "./user.service";
import socket from './socket';
const API_URL = require("./index");

const sendNotification = (trade, msg) => {
    const sender = {
        id: AuthService.getCurrentUser().id,
        username: AuthService.getCurrentUser().username
    };
    let receiverId = null;
    if (sender.id == trade.user_seller._id) {
        receiverId = trade.user_buyer._id
    } else if (sender.id == trade.user_buyer._id) {
        receiverId = trade.user_seller._id
    }

    const data = {
        type: "trade",
        sender: sender.id,
        receiver: receiverId,
        url: `/trade/${trade._id}`,
        message: msg,
        createdAt: new Date()
    };
    socket.emit("notifyUser", data);
    UserService.addNotification(data);
}

class TradeService {
    createTrade(itemid, userid) {
        return axiosTokenHeader.post(API_URL + "trade", {
            itemid,
            userid
        });
    }

    deleteTrade(id) {
        return axiosTokenHeader.delete(API_URL + "trade/" + id);
    }

    cancelTrade(itemid, userid) {
        return axiosTokenHeader.patch(API_URL + "cancel/trade", {
            itemid,
            userid
        });
    }

    createTradeWithNotification(itemid, userid) {
        return axiosTokenHeader.post(API_URL + "trade", {
            itemid,
            userid
        }).then(
            response => {
                const trade = response.data.trade;
                const item = response.data.item;

                const sender = {
                    id: AuthService.getCurrentUser().id,
                    username: AuthService.getCurrentUser().username
                };
                let receiverId = null;
                if (sender.id == trade.user_seller) {
                    receiverId = trade.user_buyer;
                } else if (sender.id == trade.user_buyer) {
                    receiverId = trade.user_seller;
                }

                const data = {
                    type: "trade",
                    sender: sender.id,
                    receiver: receiverId,
                    url: `/trade/${trade._id}`,
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

    deleteTradeWithNotification(trade) {
        sendNotification(
            trade,
            `Your trade <b>${trade._id}</b> has been deleted. Click here for more details.`
        );
        return axiosTokenHeader.delete(API_URL + "trade/" + trade._id);
    }

    cancelTradeWithNotification(trade) {
        sendNotification(
            trade,
            `User <b>${AuthService.getCurrentUser().username}</b> has cancelled a trade. Click here for more details.`
        );
        return axiosTokenHeader.patch(API_URL + "cancel/trade", {
            itemid: trade.item._id,
            userid: AuthService.getCurrentUser().id
        });
    }

    getTrade(id) {
        return axiosTokenHeader.get(API_URL + "trade/" + id);
    }
    getAllTrades() {
        return axiosTokenHeader.get(API_URL + "trades");
    }
    getTradesByBuyer(userid, status, sort, page, limit) {
        const url = `${userid}?status=${status}&sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "trades/buyer/" + url);
    }
    getTradesBySeller(userid) {
        return axiosTokenHeader.get(API_URL + "trades/seller/" + userid);
    }
    getTradesByItem(itemid) {
        return axiosTokenHeader.get(API_URL + "trades/item/" + itemid);
    }

    approveTrade(trade, userid) {
        sendNotification(
            trade,
            `User <b>${AuthService.getCurrentUser().username}</b> has has approved your trade request. Click here for more details.`
        );
        return axiosTokenHeader.patch(API_URL + "trade/approve/" + trade._id, { userid });
    }
    denyTrade(trade, userid) {
        sendNotification(
            trade,
            `User <b>${AuthService.getCurrentUser().username}</b> has has denied your trade request. Click here for more details.`
        );
        return axiosTokenHeader.patch(API_URL + "trade/deny/" + trade._id, { userid });
    }
}

export default new TradeService();