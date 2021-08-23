const mongoose = require("mongoose");

const Image = mongoose.model(
    "Image",
    new mongoose.Schema({
        name: String,
        size: String,   // size of image in Btyes
        type: String, // e.g image/png
        item: { // item the image is belonged to
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        cover: Boolean  // image is item's cover or not
    })
);

module.exports = Image;