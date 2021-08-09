const mongoose = require("mongoose");

const Item = mongoose.model(
    "Item",
    new mongoose.Schema({
        name: String,
        quantity: {
            type: Number,
            min: 1, max: 999
        },
        type: String,
        images: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Image"
            }
        ],
        forItemName: String,
        forItemQty: {
            type: Number,
            min: 1, max: 999
        },
        forItemType: String,
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        expiration_date: Date,
        upload_date: Date
    })
);

module.exports = Item;