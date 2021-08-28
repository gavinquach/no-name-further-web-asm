const { validate } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const router = require("../routes");

router.post("/login", controller.login);

module.exports = router;