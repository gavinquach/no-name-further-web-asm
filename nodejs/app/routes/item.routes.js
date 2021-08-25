const controller = require("../controllers/item.controller");
const { validate } = require("../middlewares");
const uploadFile = require("../middlewares/storeImage");
const router = require("../routes");

router.post("/add/item", [
    validate.checkUploadPath,
    uploadFile.multiple
], controller.createItem);

router.post("/edit/item/:id", [
    validate.checkUploadPath,
    uploadFile.multiple
], controller.editItem);

// old code (storing image base64 URL on database)
// router.post("/add/item", controller.createItem);
// router.post("/edit/item/:id", controller.editItem);

router.get("/view/items", controller.getAllItems);
router.get("/view/user/items/:id", controller.getUserItems);
router.get("/view/item/:id", controller.getItem);
router.get("/delete/item/:id", controller.deleteItem);

module.exports = router;