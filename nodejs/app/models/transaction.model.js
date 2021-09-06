const mongoose = require("mongoose");

const hoursFromNow = () => {
    var timeObject = new Date();
    timeObject.setHours(timeObject.getHours() + 48);
    return timeObject;
}

const Transaction = mongoose.model(
    "Transaction",
    new mongoose.Schema({
        user_seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        user_buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item"
        },
        creation_date: {
            type: Date,
            default: Date.now
        },
        expiration_date: {
            type: Date,
            default: hoursFromNow
        },
        finalization_date: Date,
        status: String
    })
);

module.exports = Transaction;