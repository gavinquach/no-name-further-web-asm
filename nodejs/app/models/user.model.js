const mongoose = require("mongoose");

const arrayLimit = (val) => {
    return val.length === 2;
}

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        email: String,
        phone: String,
        emailToken: String,
        verified: {
            type: Boolean,
            default: false
        },
        location: {
            type: [String],
            validate: [arrayLimit, '{PATH} exceeds the limit of 2']
        },
        password: {
            type: String,
            required: true
        },
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ],
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
            }
        ],
        cart: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item"
            }
        ],
        notifications: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Notification"
            }
        ],
    })
);

module.exports = User;