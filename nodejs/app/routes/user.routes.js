const controller = require("../controllers/user.controller");
const { validate } = require("../middlewares");
const router = require("../routes");

router.get("/view/users", controller.viewUsers);
router.get("/view/user/:id", controller.viewOneUser);

router.post("/edit/user/:id", [
    validate.validateError,
    validate.userValidationRules,
    validate.checkDuplicateUsernameOrEmail
],
    controller.editUser
);

router.get("/delete/user/:id", controller.deleteUser);

router.post("/user/edit/password/:id", controller.editPassword);

router.post("/addtocart", controller.addItemToCart);
router.post("/deletefromcart/:id", controller.deleteItemFromCart);

// router.get("/api/test/all", controller.allAccess);
// router.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);
// router.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

module.exports = router;