const mongoose = require("mongoose");

const Transaction = mongoose.model(
    "Transaction",
    new mongoose.Schema({
        user_seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        user_buyer: {
            type: mongoose.Schema.Types.ObjectId,
            preferences: { default: null },
            ref: "User"
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        creation_date: Date,
        expirational_date: Date,
        finalization_date: Date,
        status: String
    })
);

module.exports = Transaction;