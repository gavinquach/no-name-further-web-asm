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
        status: {
            type: String,
        },
        read: {
            type: Boolean,
            default: false
        },
        markUnread: {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            },
            isMarked: {
                type: Boolean,
                default: false
            }
        },
    }, { timestamps: true })
);

module.exports = Message;