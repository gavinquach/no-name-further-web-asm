import { axiosTokenHeader } from "./AxiosInstance"
const API_URL = require("./index");

class ChatService {
    postMessage() {
        return axiosTokenHeader.post(API_URL + "message");
    }

    getMessages(conversationId) {
        return axiosTokenHeader.get(API_URL + "message/", conversationId);
    }

    postConversation() {
        return axiosTokenHeader.post(API_URL + "conversation");
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