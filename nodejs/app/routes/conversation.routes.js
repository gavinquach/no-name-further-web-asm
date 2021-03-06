const controller = require("../controllers/conversation.controller");
const { authJwt, validate } = require("../middlewares");
const router = require("../routes");

// add conversation
router.post("/conversation", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.postConversation);


// get conversations
router.get("/conversations/:id", [
    authJwt.verifyToken,
    authJwt.isUser,
    validate.checkEmptyConversations
], controller.getConversations);

// get conversations
router.get("/request/conversations/:id", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.getConversations);

// get conversation between two user
router.get("/conversation/:firstUserId/:secondUserId", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getConversation);

// get conversation from conversation id
router.get("/conversation-by-id/:id", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getConversationById);

module.exports = router;