import { axiosTokenHeader } from "./AxiosInstance"
import socket from './socket';
const API_URL = require("./index");

class ChatService {
    postMessage(messageObj) {
        return axiosTokenHeader.post(API_URL + "message", messageObj)
            .then(response => {
                socket.emit("sendMessage", response.data);
                return response;
            }).catch((error) => {
                return error;
            });
    }

    getMessages(conversationId, sort, page, limit) {
        const url = `${conversationId}?sort=${sort}&page=${page}&limit=${limit}`
        return axiosTokenHeader.get(API_URL + "messages/" + url);
    }

    setMessageToRead(messageId) {
        return axiosTokenHeader.patch(API_URL + "read-message/" + messageId);
    }

    setMessagesToRead(conversationId, receiverId) {
        return axiosTokenHeader.patch(API_URL + "read-messages/" + conversationId, {
            receiverId
        });
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

    getConversationsRequest(userid) {
        return axiosTokenHeader.get(API_URL + "request/conversations/" + userid);
    }

    getConversation(firstUserId, secondUserId) {
        const url = `${firstUserId}/${secondUserId}`;
        return axiosTokenHeader.get(API_URL + "conversation/" + url);
    }
}

export default new ChatService();