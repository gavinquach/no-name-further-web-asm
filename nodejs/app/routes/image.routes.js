const controller = require("../controllers/image.controller");
const { validate } = require("../middlewares");
const uploadFile = require("../middlewares/storeImage");
const router = require("../routes");

router.post("/upload-single", [
    validate.checkUploadPath,
    uploadFile.single
],
    controller.uploadSingle
);

router.post("/upload-multiple", [
    validate.checkUploadPath,
    uploadFile.multiple
],
    controller.uploadMultiple
);

router.get("/files", controller.getListFiles);

module.exports = router;