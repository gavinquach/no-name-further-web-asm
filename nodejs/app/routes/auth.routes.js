const controller = require("../controllers/auth.controller");
const router = require("../routes");

router.post("/login", controller.login);
router.get("/confirmation/:email/:token", controller.confirmEmail);
router.post("/resend-email", controller.resendLink);

module.exports = router;