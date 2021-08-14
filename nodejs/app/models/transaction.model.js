const mongoose = require("mongoose");

const Transaction = mongoose.model(
    "Transaction",
    new mongoose.Schema({
        user: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        item: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
            }
        ],
        creation_date: Date,
        finlization_date: Date
    })
);

module.exports = Transaction;