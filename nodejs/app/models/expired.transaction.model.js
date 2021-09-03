const mongoose = require("mongoose");

const hoursFromNow = () => {
    var timeObject = new Date();
    timeObject.setHours(timeObject.getHours() + 48);
    return timeObject;
}

const ExpiredTransaction = mongoose.model(
    "ExpiredTransaction",
    new mongoose.Schema({
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            require: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: "48h"
        },
        expiredAt: {
            type: Date,
            default: hoursFromNow
        }
    })
);

module.exports = ExpiredTransaction;