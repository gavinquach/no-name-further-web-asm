const controller = require("../controllers/item.controller");
const { validate } = require("../middlewares");
const uploadFile = require("../middlewares/storeImage");
const router = require("../routes");

router
    .route("/item/:id")
    .get(controller.getItem)
    .delete(controller.deleteItem)
    .put([
        validate.checkUploadPath,
        uploadFile.multiple
    ], controller.editItem);

router.post("/item", [
    validate.checkUploadPath,
    uploadFile.multiple
], controller.createItem);

router.get("/items", controller.getAllItems);

module.exports = router;