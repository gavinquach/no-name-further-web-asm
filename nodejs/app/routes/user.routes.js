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