import { axiosTokenHeader } from "./AxiosInstance"
const API_URL = require("./index");
import socket from './socket';

class ChatService {
    postMessage(messageObj) {
        return axiosTokenHeader.post(API_URL + "message", messageObj)
            .then(response => {
                socket.emit("sendMessage", messageObj);
                return response;
            }).catch((error) => {
                return error;
            });
    }

    getMessages(conversationId) {
        return axiosTokenHeader.get(API_URL + "messages/" + conversationId);
    }

    postConversation(senderId, receiverId) {
        return axiosTokenHeader.post(API_URL + "conversation", {
            senderId,
            receiverId
        });
    }

    getConversations(userid) {
        return axiosTokenHeader.get(API_URL + "conversations/" + userid);
    }

    getConversation(firstUserId, secondUserId) {
        const url = `${firstUserId}/${secondUserId}`;
        return axiosTokenHeader.get(API_URL + "conversation/" + url);
    }
}

export default new ChatService();