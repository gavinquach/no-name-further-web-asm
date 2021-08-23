const path = require('path');

module.exports = {
    path: path.join(__dirname, "../../images/"),
    maxSize: 5 * 1024 * 1024,   // 5MB
    maxNumFiles: 5  // allow upload of 5 files at once
};