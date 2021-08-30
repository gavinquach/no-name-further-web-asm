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
        expireAt: {
            type: Date,
            default: Date.now,
            index: {
                expires: 86400 * 1000   // expire in 24 hours
            }
        }
    })
);


module.exports = tokenSchema;