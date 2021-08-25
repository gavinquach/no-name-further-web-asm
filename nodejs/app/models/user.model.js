const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        email: String,
        phone: String,
        location: [String],
        password: { type: String, required: true },
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
        ]
    })
);

module.exports = User;