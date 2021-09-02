const controller = require("../controllers/item.controller");
const { authJwt, validate } = require("../middlewares");
const router = require("../routes");


router
    .route("/most-items-quantity")
    .get(controller.aliasTopItemQuantity, controller.getAllItems);

router
    .route("/item/:id")
    .get(controller.getItem)
    .delete([
        authJwt.verifyToken,
        authJwt.isUser
    ], controller.deleteItem)
    .put([
        authJwt.verifyToken,
        authJwt.isUser,
        validate.checkUploadPath
    ], controller.editItem);

router.post("/item", [
    authJwt.verifyToken,
    authJwt.isUser,
    validate.checkUploadPath
], controller.createItem);

router.get("/items", controller.getAllItems);
router.get("/items/:category/:page", controller.getItemsByCategory);

module.exports = router;