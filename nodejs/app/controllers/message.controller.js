const model = require("../models");
const User = model.user;
const Conversation = model.conversation;
const Message = model.message;
const APIFeatures = require("./apiFeature");

// add message 
exports.postMessage = async (req, res) => {
    if (req.body.sender == req.body.receiver) {
        return res.status(403).send({ message: "Sender can't be the same as receiver!" });
    }

    // check if sender and receiver exist
    let sender = null
    let receiver = null;
    try {
        sender = await User.findById(req.body.sender).exec();
        receiver = await User.findById(req.body.receiver).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!sender) return res.status(404).send({ message: "Sender not found." });
    if (!receiver) return res.status(404).send({ message: "Receiver not found." });

    let conversation = null;
    // check if conversation exists
    try {
        conversation = await Conversation.findById(req.body.conversationId);
    } catch (err) {
        return res.status(500).send(err);
    }

    // conversation not found, create one
    if (!conversation) {
        // return res.status(404).send({ message: "Conversation not found." });
        conversation = new Conversation({
            members: [sender._id, receiver._id],
        });

        try {
            await conversation.save();
        } catch (err) {
            return res.status(500).json(err);
        }
    }

    if (!conversation.members.includes(sender._id) || !conversation.members.includes(receiver._id)) {
        return res.status(404).send({ message: "Invalid user ID!" });
    }

    const newMessage = new Message({
        conversationId: conversation._id,
        sender: sender._id,
        receiver: receiver._id,
        text: req.body.text,
        status: "Sending"
    });

    // save message on database
    let savedMessage = null;
    try {
        savedMessage = await newMessage.save();
    } catch (err) {
        res.status(500).json(err);
    }

    // attempt to find message on database, if it's there, set status to "Sent"
    try {
        const message = await Message.findById(savedMessage._id);
        if (!message) return res.status(500).send({ message: "Something went wrong, please try again." });

        conversation.updatedAt = new Date();
        await conversation.save();

        savedMessage.status = "Sent";
        const savedSentMessage = await savedMessage.save();
        res.status(200).json(savedSentMessage);
    } catch (err) {
        res.status(500).json(err);
    }
}

// get messages by conversation id
exports.getMessages = async (req, res) => {
    // intialize 
    let messages = [];
    let conversation = null;
    let total = 0;

    // check if conversation is available in database
    try {
        conversation = await Conversation.findById({ _id: req.params.conversationId }).exec();
        if (!conversation) return res.status(404).send({ message: "Conversation not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    // find list of messages in database to see if any message exists and retrieve
    try {
        const features = new APIFeatures(
            Message.find({
                conversationId: conversation._id
            }), req.query)
            .sort();

        //count retrieved total data before pagination
        total = await Message.countDocuments(features.query);

        // paginating data
        messages = await features.paginate().query;
        if (!messages || messages.length < 1) return res.status(404).send({ message: "Messages not found." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        await res.status(200).json({
            result: messages.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            messages: messages
        });;
    } catch (err) {
        res.status(500).json(err);
    }
}

// get unread messages by conversation id  and user id
exports.getUserConversationUnreadMessages = async (req, res) => {
    // intialize 
    let messages = [];
    let conversation = null;
    let total = 0;

    // check if conversation is available in database
    try {
        conversation = await Conversation.findById({ _id: req.params.conversationId }).exec();
        if (!conversation) return res.status(404).send({ message: "Conversation not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    // find list of messages in database to see if any message exists and retrieve
    try {
        messages = await Message.find({
            conversationId: conversation._id,
            receiver: req.params.userid,
            read: false
        }).exec();

        //count retrieved total data before pagination
        total = await Message.countDocuments({
            conversationId: conversation._id,
            receiver: req.params.userid,
            read: false
        });

        res.status(200).json({
            total: total,
            messages: messages
        });
    } catch (err) {
        res.status(500).json(err);
    }
}

// get unread messages by user id
exports.getUserUnreadMessages = async (req, res) => {
    let conversations = [];

    // check if conversation is available in database
    try {
        conversations = await Conversation.find().exec();
        if (!conversations || conversations.length < 1) return res.status(404).send({ message: "Conversation not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    let messages = [];
    let total = 0;
    for (const conversation of conversations) {
        // find list of messages in database to see if any message exists and retrieve
        try {
            const temp = await Message.find({
                conversationId: conversation._id,
                receiver: req.params.userid,
                read: false
            }).exec();

            temp.map((message) => {
                message && messages.push(message);
            });

            //count retrieved total data before pagination
            total += await Message.countDocuments({
                conversationId: conversation._id,
                receiver: req.params.userid,
                read: false
            });
        } catch (err) {
            res.status(500).json(err);
        }
    }

    try {
        res.status(200).json({
            total: total,
            messages: messages
        });
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.setMessageToRead = async (req, res) => {
    let message = null;
    try {
        message = await Message.findById(req.params.messageId);
    } catch (err) {
        return res.status(500).json(err);
    }
    if (!message) return res.status(404).send({ message: "Message not found." });
    if (message.read) return res.status(409).send({ message: "Message already set to read." });

    try {
        message.read = true;
        const userMessage = await message.save();
        res.status(200).send({
            message: "Message set to read successfully!",
            userMessage: userMessage
        });
    } catch (err) {
        return res.status(500).json(err);
    }
}

exports.setMessagesToRead = async (req, res) => {
    let messages = [];
    try {
        messages = await Message.find({
            conversationId: req.params.conversationId,
            receiver: req.body.receiverId
        });
    } catch (err) {
        return res.status(500).json(err);
    }
    if (!messages || messages.length < 1) return res.status(404).send({ message: "Messages not found." });

    for (const message of messages) {
        if (message.read) continue;
        try {
            message.read = true;
            await message.save();
        } catch (err) {
            return res.status(500).json(err);
        }
    }

    res.status(200).send({
        message: "Messages set to read successfully!",
        messages: messages
    });
}