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

// ==========================================
// =========== USER =========== 
// View all users
router.get("/users", [
    authJwt.verifyToken,
    authJwt.canViewAdmins,
], controller.viewAllUsers);

// View all admins 
router.get("/users/admin", [
    authJwt.verifyToken,
    authJwt.canViewAdmins
], controller.viewAdmins);

// View all non-admin users 
router.get("/users/user", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.viewUsers);

// View all admins sorted by field
router.get("/users/admin-sorted-by-field", [
    authJwt.verifyToken,
    authJwt.canViewAdmins
], controller.viewAdminsSortedByField);

// View all non-admin users sorted by field
router.get("/users/user-sorted-by-field", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.viewUsersSortedByField);

// get, edit, delete user with id as param
router
    .route("/user/:id")
    .get([
        authJwt.verifyToken
    ], controller.viewOneUser)
    .put([
        authJwt.verifyToken,
        authJwt.isValidAdmin("edit_user"),
        validate.validateError,
        validate.userValidationRules,
        validate.checkDuplicateUsernameOrEmail
    ], controller.editUser)
    .delete([
        authJwt.verifyToken,
        authJwt.isValidAdmin("delete_user")
    ], controller.deleteUser);

// create user
router.post("/user", [
    authJwt.verifyToken,
    authJwt.isValidAdmin("create_user"),
    validate.validateError,
    validate.userValidationRules,
    validate.checkDuplicateUsernameOrEmail,
    validate.checkRolesExisted
], controller.createUser);

// get, edit, delete admin with id as param
router
    .route("/admin/:id")
    .get([
        authJwt.verifyToken,
        authJwt.isAdmin
    ], controller.viewOneUser)
    .put([
        authJwt.verifyToken,
        authJwt.isValidAdmin("edit_admin"),
        validate.validateError,
        validate.userValidationRules,
        validate.checkDuplicateUsernameOrEmail
    ], controller.editAdmin)
    .delete([
        authJwt.verifyToken,
        authJwt.isValidAdmin("delete_admin")
    ], controller.deleteAdmin);

// create admin
router.post("/admin", [
    authJwt.verifyToken,
    authJwt.isValidAdmin("create_admin"),
    validate.validateError,
    validate.userValidationRules,
    validate.checkDuplicateUsernameOrEmail,
    validate.checkRolesExisted
], controller.createAdmin);

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

// Get user (public info)
router.get("/public/user/:username", controller.publicGetUser);
// ==========================================


// ======================================
// =========== ITEM =========== 
router.get("/user/items/:id", controller.getUserItems);
// ==========================================


// ======================================
// =========== CART =========== 
// add and delete item from cart
router.post("/user/cart", [
    authJwt.verifyToken,
    authJwt.isUser,
    authJwt.isNotRoot
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
// ======================================


// =============================================
// =========== NOTIFICATIONS =========== 
// get notifications
router.get("/user/notifications/:id", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.getUserNotifications);

// get unread notifications
router.get("/user/unreadnotifications/:id", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.getUserUnreadNotifications);

// get notifications by type
router.get("/user/notifications/:userid/:type", [
    authJwt.verifyToken,
    authJwt.isUser,
], controller.getUserNotificationsByType);

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

// set many notifcations to unread
router.patch("/user/unread/notifications", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.setUnreadNotifications);
// =============================================

// search
router.get("/search/:keyword", controller.search);

module.exports = router;