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
            expires: 1000
        },
    })
);

module.exports = ExpiredTransaction;