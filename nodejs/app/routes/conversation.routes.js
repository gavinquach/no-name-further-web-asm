const controller = require("../controllers/conversation.controller");
const { authJwt } = require("../middlewares");
const router = require("../routes");

// add conversation
router.post("/conversation", [
    // authJwt.verifyToken,
    // authJwt.isUser
], controller.postConversation);


// get conversations
router.get("/conversations/:id", [
    // authJwt.verifyToken,
    // authJwt.isUser
], controller.getConversations);

// get conversation between two user
router.get("/conversation/:firstUserId/:secondUserId", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getConversation);

module.exports = router;