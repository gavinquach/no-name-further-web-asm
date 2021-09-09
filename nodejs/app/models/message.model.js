const mongoose = require("mongoose");


const Message = mongoose.model(
    "Message",
    new mongoose.Schema({

        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
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
        text: {
            type: String,
        },
    },
        { timestamps: true })
);

module.exports = Message;