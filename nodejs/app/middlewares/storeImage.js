const util = require("util");
const multer = require("multer");
const img = require("../config/img.config");

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, img.path);
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + "_" + file.originalname);
    },
});

const fileFilter = (req, file, callback) => {
    // allowed file types
    const match = ["image/png", "image/jpeg", "image/jpg"];

    if (match.indexOf(file.mimetype) > -1) {
        callback(null, true);
    } else {
        let message = `${file.originalname} is invalid. Only accept png, jpeg, jpg.`;
        return callback(message, false);
    }
}

const uploadSingle = multer({
    storage: storage,
    limits: { fileSize: img.maxSize },
    fileFilter: fileFilter
}).single("file");

const uploadMultiple = multer({
    storage: storage,
    limits: { fileSize: img.maxSize },
    fileFilter: fileFilter
}).array("files", img.maxNumFiles);

const single = util.promisify(uploadSingle);
const multiple = util.promisify(uploadMultiple);

const uploadFile = {
    single,
    multiple
};

module.exports = uploadFile;