const multer = require('multer');   // npm install multer --save
 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../src/images/items') // where the image will be stored
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now()) // name of file that will be stored
    }
});

const fileFilter = (req, res, cb) => {
    // reject file type
    if (file.mimetype === "image/jpeg"
    || file.mimetype === "image/jpg"
    || file.mimetype === "image/png") {
        cb(null, false);
    }
    else {
        cb(null, true);
    }
}
 
const storeImage = multer({
    storage: storage,
    limits: {
        // limit file size to 10MB
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});

module.exports = storeImage;