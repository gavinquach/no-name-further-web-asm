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

    setMessageToRead(messageId) {
        return axiosTokenHeader.patch(API_URL + "read-message/" + messageId);
    }

    setMessagesToRead(conversationId) {
        return axiosTokenHeader.patch(API_URL + "read-messages/" + conversationId);
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