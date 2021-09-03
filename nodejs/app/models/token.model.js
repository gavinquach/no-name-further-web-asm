const mongoose = require("mongoose");

const tokenSchema = mongoose.model(
    "Token",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: "24h"
        }
    })
);


module.exports = tokenSchema;