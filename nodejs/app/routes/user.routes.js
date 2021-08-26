const controller = require("../controllers/user.controller");
const { validate } = require("../middlewares");
const router = require("../routes");
const authJwt = require("../middlewares/authJwt")

// router.get("/view/users", controller.viewUsers);
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

// Dummy Routes
router.get("/test/view_admin", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isViewAdmin], (req, res) => {
    res.send("View Admin")
})

router.get("/test/edit_admin", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isEditAdmin], (req, res) => {
    res.send("Edit Admin")
})

router.get("/test/delete_admin", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isDeleteAdmin], (req, res) => {
    res.send("Delete Admin")
})

router.get("/test/create_admin", [authJwt.verifyToken, authJwt.isAdmin, authJwt.isCreateAdmin], (req, res) => {
    res.send("Create Admin")
})

module.exports = router;