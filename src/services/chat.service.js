import { axiosTokenHeader } from "./AxiosInstance"
const API_URL = require("./index");

class ChatService {
    postMessage(messageObj) {
        return axiosTokenHeader.post(API_URL + "message", messageObj);
    }

    getMessages(conversationId) {
        return axiosTokenHeader.get(API_URL + "message/" + conversationId);
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