const controller = require("../controllers/image.controller");
const { authJwt, validate } = require("../middlewares");
const router = require("../routes");

router.post("/upload-single", [
    authJwt.verifyToken,
    authJwt.isUser,
    validate.checkUploadPath
], controller.uploadSingle);

router.post("/upload-multiple", [
    authJwt.verifyToken,
    authJwt.isUser,
    validate.checkUploadPath
], controller.uploadMultiple);

router.get("/files", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getListFiles);

module.exports = router;