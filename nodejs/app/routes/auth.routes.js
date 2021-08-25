const { validate } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const router = require("../routes");

router.post("/signup", [
        validate.validateError,
        validate.userValidationRules,
        validate.checkDuplicateUsernameOrEmail,
        validate.checkRolesExisted
    ],
    controller.signup
);

router.post("/signupWithRoles", [
        validate.validateError,
        validate.userValidationRules,
        validate.checkDuplicateUsernameOrEmail,
        validate.checkRolesExisted
    ],
    controller.signupWithRoles
);

router.post("/login", controller.login);

module.exports = router;