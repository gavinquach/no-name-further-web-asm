const mongoose = require("mongoose");

const ItemCategory = mongoose.model(
    "ItemCategory",
    new mongoose.Schema({
        name: String
    })
);

module.exports = ItemCategory;