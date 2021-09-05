const mongoose = require("mongoose");

const Notification = mongoose.model(
    "Notification",
    new mongoose.Schema({
        type: {
            type: String,
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        url: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        }
    })
);

module.exports = Notification;