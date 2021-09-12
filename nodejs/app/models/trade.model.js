const mongoose = require("mongoose");

const hoursFromNow = () => {
    var timeObject = new Date();
    timeObject.setHours(timeObject.getHours() + 48);
    return timeObject;
}

const Trade = mongoose.model(
    "Trade",
    new mongoose.Schema({
        user_seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        user_buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        creation_date: {
            type: Date,
            default: Date.now,
            required: true
        },
        expiration_date: {
            type: Date,
            default: hoursFromNow
        },
        finalization_date: Date,
        status: {
            type: String,
            required: true
        },
        cancel_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    })
);

module.exports = Trade;