const controller = require("../controllers/image.controller");
const { validate } = require("../middlewares");
const uploadFile = require("../middlewares/storeImage");
const router = require("../routes");

router.post("/upload-single", [
    validate.checkUploadPath
],
    controller.uploadSingle
);

router.post("/upload-multiple", [
    validate.checkUploadPath
],
    controller.uploadMultiple
);

router.get("/files", controller.getListFiles);

module.exports = router;