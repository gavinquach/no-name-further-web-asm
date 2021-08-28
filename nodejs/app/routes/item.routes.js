const controller = require("../controllers/item.controller");
const { validate } = require("../middlewares");
const router = require("../routes");

router
    .route("/item/:id")
    .get(controller.getItem)
    .delete(controller.deleteItem)
    .put([
        validate.checkUploadPath
    ], controller.editItem);

router.post("/item", [
    validate.checkUploadPath
], controller.createItem);

router.get("/items", controller.getAllItems);

module.exports = router;