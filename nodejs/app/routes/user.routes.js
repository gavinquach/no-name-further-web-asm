const controller = require("../controllers/user.controller");
const { validate } = require("../middlewares");
const router = require("../routes");
const authJwt = require("../middlewares/authJwt")

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
router.post("/user/cart/view", controller.getUserCart);
router.get("/user/items/:id", controller.getUserItems);

// router.get("/api/test/all", controller.allAccess);
// router.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);
// router.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

// Source: https://stackoverflow.com/a/1026087
capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Dummy routes for testing
const model = require("../models");
model.ROLES.map(role => {
    router.get(`/test/${role}`, [
        authJwt.verifyToken,
        authJwt.isValidAdmin(role)
    ], (req, res) => {
        res.send(capitalizeFirstLetter(role.replace("_", " ")));
    });
});

module.exports = router;