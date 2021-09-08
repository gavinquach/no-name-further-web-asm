const model = require("../models");
const User = model.user;
const Conversation = model.conversation;
const Message = model.message;
const APIFeatures = require("./apiFeature");

// add message 
exports.postMessage = async (req, res) => {

    let sender = null
    let receiver = null;
    let conversation = null;


    // check if sender and receiver available
    try {
        sender = await User.findById(req.body.sender).exec();
        receiver = await User.findById(req.body.receiver).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!sender) return res.status(404).send({ message: "Sender not found." });
    if (!receiver) return res.status(404).send({ message: "Receiver not found." });


    // check if conversation exists
    try {
        conversation = await Conversation.findById(req.body.conversationId);
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!conversation) return res.status(404).send({ message: "Conversation not found." });
    if (!conversation.members.includes(sender._id) || !conversation.members.includes(receiver._id)) return res.status(404).send({ message: "User Id not match with conversation" });




    const newMessage = new Message({
        conversationId: conversation._id,
        sender: sender._id,
        receiver: receiver._id,
        text: req.body.text
    });


    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
}


// get messages by Id conversation
exports.getMessages = async (req, res) => {

    // intialize 
    let messages = [];
    let conversation = null;
    let total = 0;
    let limit = 1

    // validate value
    if (req.query.limit || req.query.limit === 'undefined' || parseInt(req.query.limit) > 0) {
        limit = parseInt(req.query.limit);
    }

    // check if conversation is available in database
    try {
        conversation = await Conversation.findById({ _id: req.params.conversationId }).exec();

        if (!conversation) return res.status(404).send({ message: "Conversation not found." });

    } catch (err) {
        return res.status(500).send(err);
    }


    // find list of messages in database to see if any message exists and retrieve
    try {
        const features = await new APIFeatures(
            Message.find({
                conversationId: conversation._id,
            })
            , req.query);

        //count retrieved total data before pagination
        total = await Message.countDocuments(features.query);

        // paginating data
        messages = await features.paginate().query;

        if (!messages || messages.length < 1) return res.status(404).send({ message: "Messages not found." });

        await res.status(200).json({
            result: messages.length,
            totalPages: Math.ceil(total / limit),
            messages: messages
        });;
        
    } catch (err) {
        res.status(500).json(err);
    }
}
