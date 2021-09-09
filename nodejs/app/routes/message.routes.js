const controller = require("../controllers/message.controller");
const { authJwt } = require("../middlewares");
const router = require("../routes");

// post new message
router.post("/message", [
    // authJwt.verifyToken,
    // authJwt.isUser
], controller.postMessage);


// get messages from conversation
router.get("/messages/:conversationId", [
    // authJwt.verifyToken,
    // authJwt.isUser
], controller.getMessages);


module.exports = router;