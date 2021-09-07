const controller = require("../controllers/user.controller");
const { authJwt, validate } = require("../middlewares");
const router = require("../routes");

router.post("/signup", [
    validate.validateError,
    validate.userValidationRules,
    validate.checkDuplicateUsernameOrEmail,
    validate.checkRolesExisted
],
    controller.signup
);

// View all users
router.get("/users", [
    authJwt.verifyToken,
    authJwt.canViewAdmins,
    authJwt.canViewUsers
], controller.viewAllUsers);

// View all admins 
router.get("/users/admin", [
    authJwt.verifyToken,
    authJwt.canViewAdmins
], controller.viewAdmins);

// View all non-admin users 
router.get("/users/user", [
    authJwt.verifyToken,
    authJwt.canViewUsers
], controller.viewUsers);

// get, edit, delete user with id as param
router
    .route("/user/:id")
    .get([
        authJwt.verifyToken
    ], controller.viewOneUser)
    .put([
        authJwt.verifyToken,
        authJwt.isValidAdmin("edit_admin"),
        validate.validateError,
        validate.userValidationRules,
        validate.checkDuplicateUsernameOrEmail
    ], controller.editUser)
    .delete([
        authJwt.verifyToken,
        authJwt.isValidAdmin("delete_admin")
    ], controller.deleteUser);

// create user with roles (or admin)
router.post("/user", [
    authJwt.verifyToken,
    authJwt.isValidAdmin("create_admin"),
    validate.validateError,
    validate.userValidationRules,
    validate.checkDuplicateUsernameOrEmail,
    validate.checkRolesExisted
], controller.createUserWithRoles);

// User edit own's info 
router.patch("/user/edit/:id", [
    authJwt.verifyToken,
    authJwt.isUser,
    validate.checkDuplicateUsernameOrEmail
], controller.editInfo);

// User edit own's password 
router.patch("/user/edit/password/:id", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.editPassword);

// add and delete item from cart
router.post("/user/cart", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.addItemToCart);

router.put("/user/cart/:id", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.deleteItemFromCart);

// get user cart and items
router.post("/user/cart/view", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.getUserCart);

router.get("/user/items/:id", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.getUserItems);

// get notifications
router.get("/user/notifications/:id", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.getUserNotifications);

// add notification
router.post("/user/notification", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.addNotification);

// set notifcation to read
router.patch("/user/read/notification", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.setReadNotification);

// set many notifcations to read
router.patch("/user/read/notifications", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.setReadNotifications);

module.exports = router;