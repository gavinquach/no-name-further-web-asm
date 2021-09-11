const controller = require("../controllers/message.controller");
const { authJwt } = require("../middlewares");
const router = require("../routes");

// post new message
router.post("/message", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.postMessage);

// get messages from conversation
router.get("/messages/:conversationId", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getMessages);

// get unread messages from conversation
router.get("/unreadmessages/conversation/:conversationId/:userid", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getUserConversationUnreadMessages);

// get unread messages from userid
router.get("/unreadmessages/user/:userid", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getUserUnreadMessages);

// set a message to read
router.patch("/read-message/:messageId", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.setMessageToRead);

// set messages in conversation to read
router.patch("/read-messages/:conversationId", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.setMessagesToRead);


module.exports = router;