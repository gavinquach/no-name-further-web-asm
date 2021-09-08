const { mongoose } = require("../models");
const model = require("../models");
const user = require("../models");
const User = require("../models/user.model");
const Conversation = model.conversation;

// Post new conversation
exports.postConversation = async (req, res) => {
    
    let sender = null
    let reiceiver = null;

    // check if receiver available
    try {
        sender = await User.findById(req.body.senderId).exec();
        reiceiver = await User.findById(req.body.receiverId).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!reiceiver) return res.status(404).send({ message: "Reiceiver not found." });
    if (!sender) return res.status(404).send({ message: "Sender not found." });


    // check if conversation is already available
    try {
        const conversation = await Conversation.findOne({
            members: [req.body.senderId, req.body.receiverId]
        }).exec();

        if (conversation) return res.status(401).send({ message: "Conversation already exists!" });
    } catch (err) {
        return res.status(500).send(err);
    }
  

    // save conversation
    const newConversation = new Conversation({
        members: [sender._id, reiceiver._id],
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
        console.log(user)
        conversations = await Conversation.find({
            members: { $in: [user._id] },
        });
        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json(err);
    }
    if (conversations.length < 1) return res.status(404).send({ message: "Conversations not found." });

}



// get a conversation between two userId
exports.getConversation = async (req, res) => {

    // find  users in database to see if it exists
    try {
        firstUser = await User.findById(req.body.data.firstUserId).exec()
        secondUser = await User.findById(req.body.data.secondUserId).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "Users not found." });

    // check if conversation is already available and get it 
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        }).exec();

        if (!conversation) return res.status(401).send({ message: "Conversation does not exist!" });

        res.status(200).json(conversation)
    } catch (err) {
        return res.status(500).send(err);
    }


}


