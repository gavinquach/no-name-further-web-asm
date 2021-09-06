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
    if (!file) {
        const message = `File upload error.`;
        return callback(message, false);
    }

    // allowed file types
    const match = ["image/png", "image/jpeg", "image/jpg"];
    if (match.indexOf(file.mimetype) < 0) {
        const message = `${file.originalname} is invalid. Only accept png, jpeg, jpg.`;
        return callback(message, false);
    }

    const filename = file.originalname;

    // validate filename
    if (filename.indexOf('\0') !== -1) {
        const message = `Invalid file name!`;
        return callback(message, false);
    }
    if (!filename.includes(".jpg") && !filename.includes(".jpeg") && !filename.includes(".png")) {
        const message = `Invalid file extension!`;
        return callback(message, false);
    }
    const temp = filename.replace(".jpg", "").replace(".jpeg", "").replace(".png", "")
    if (temp.includes(".")) {
        const message = `Invalid file name!`;
        return callback(message, false);
    }
    if (temp.includes("..") || temp.includes("/")) {
        const message = `Invalid file name!`;
        return callback(message, false);
    }

    callback(null, true);
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