const model = require("../models");
const User = model.user;
const Conversation = model.conversation;
const APIFeatures = require("./apiFeature");

// Post new conversation
exports.postConversation = async (req, res) => {
    let sender = null
    let receiver = null;

    // check if sender and receiver exist
    try {
        sender = await User.findById(req.body.senderId).exec();
        receiver = await User.findById(req.body.receiverId).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!sender) return res.status(404).send({ message: "Sender not found." });
    if (!receiver) return res.status(404).send({ message: "Receiver not found." });

    // check if conversation is already available
    try {
        const conversation = await Conversation.findOne({
            members: [req.body.senderId, req.body.receiverId]
        }).exec();

        if (conversation) return res.status(401).send({
            message: "Conversation already exists!",
            conversation: conversation
        });
    } catch (err) {
        return res.status(500).send(err);
    }

    // save conversation
    const newConversation = new Conversation({
        members: [sender._id, receiver._id],
    });

    // const newConversation = new Conversation(req.body.data);
    try {
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
}

// get conversations of a user 
exports.getConversations = async (req, res) => {
    // intialize 
    let total = 0;
    let limit = 1
    let conversations = [];
    let user = null


    // check if user is available in database
    try {
        user = await User.findById({ _id: req.params.id }).exec();
        if (!user) return res.status(404).send({ message: "User not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    // find list of conversations in database to see if any conversation exists
    try {
        const features = new APIFeatures(
            Conversation.find({
                members: { $in: [user._id] },
            })
                .populate("members", "-__v")
            , req.query)
            .sort();

        //count retrieved total data before pagination
        total = await Conversation.countDocuments(features.query);

        // paginating data
        conversations = await features.paginate().query;
        if (!conversations || conversations.length < 1) {
            return res.status(404).send({ message: "Conversations not found." });
        }


        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        await res.status(200).json({
            result: conversations.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            conversations: conversations
        });
    } catch (err) {
        res.status(500).json(err);
    }
}


// get a conversation between two userId
exports.getConversation = async (req, res) => {
    let firstUser = null;
    let secondUser = null;

    // find  users in database to see if it exists
    try {
        firstUser = await User.findById(req.params.firstUserId).exec()
        secondUser = await User.findById(req.params.secondUserId).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!firstUser) return res.status(404).send({ message: "First user not found." });
    if (!secondUser) return res.status(404).send({ message: "Second user not found." });

    // check if conversation is already available and get it 
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [firstUser._id, secondUser._id] },
        }).exec();
        if (!conversation) return res.status(404).send({ message: "Conversation not found." });

        res.status(200).json(conversation)
    } catch (err) {
        return res.status(500).send(err);
    }
}


