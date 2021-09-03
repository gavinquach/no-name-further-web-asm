const mongoose = require("mongoose");

const ExpiredTransaction = mongoose.model(
    "ExpiredTransaction",
    new mongoose.Schema({
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transaction",
            require: true
        },
        expirational_date:{
            type: Date,
            default: Date.now,
            index: {
                expires: 10000
            }
        },
    })
);

module.exports = ExpiredTransaction;