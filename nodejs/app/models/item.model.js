const mongoose = require("mongoose");

const Item = mongoose.model(
    "Item",
    new mongoose.Schema({
        name: String,
        quantity: {
            type: Number,
            min: 1, max: 999
        },
        type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ItemCategory"
        },
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
        forItemType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ItemCategory"
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        offers: {
            type: Number,
            min: 0,
            default: 0,
        },
        expiration_date: Date,
        upload_date: Date,
        last_update: Date
    })
);

module.exports = Item;