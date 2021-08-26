const controller = require("../controllers/user.controller");
const { validate } = require("../middlewares");
const router = require("../routes");

router.post("/signup", [
        validate.validateError,
        validate.userValidationRules,
        validate.checkDuplicateUsernameOrEmail,
        validate.checkRolesExisted
    ],
    controller.signup
);

router.post("/signup-with-roles", [
        validate.validateError,
        validate.userValidationRules,
        validate.checkDuplicateUsernameOrEmail,
        validate.checkRolesExisted
    ],
    controller.createUserWithRoles
);

// View all users 
router.get("/users",controller.viewUsers);

// CRUD user with id as param
router
    .route("/user/:id")
    .get(controller.viewOneUser)
    .delete(controller.deleteUser)
    .put([
        validate.validateError,
        validate.userValidationRules,
        validate.checkDuplicateUsernameOrEmail
    ], controller.editUser);

// Edit user password 
router.patch("/user/password/:id", controller.editPassword);

// add and delete item from cart
router.post("/user/cart", controller.addItemToCart);
router.put("/user/cart/:id", controller.deleteItemFromCart);

// get user cart and items
router.get("/user/cart/:id", controller.getUserCart);
router.get("/user/items/:id", controller.getUserItems);

// router.get("/api/test/all", controller.allAccess);
// router.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);
// router.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

module.exports = router;