const mongoose = require("mongoose");

const Image = mongoose.model(
    "Image",
    new mongoose.Schema({
        name: String,
        size: String,   // size of image in Btyes
        type: String, // e.g image/png
        upload_date: Date,   // date the image was uploaded
        data_url: Buffer,    // base64 URL of image
        item: { // item the image is belonged to
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        cover: Boolean  // image is item's cover or not
    })
);

module.exports = Image;