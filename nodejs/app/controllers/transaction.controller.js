
const model = require("../models");
const User = model.user;
const Item = model.item;
const Transaction = model.transaction;

// Get transaction by Id
exports.getTransaction = async (req, res) => {
    Transaction.findById({
        _id: req.params.id
    })
        .populate("user_seller", "-__v")
        .populate("user_buyer", "-__v")
        .populate("item", "-__v")
        .populate("seller", "-__v")
        .exec((err, transaction) => {
            if (err) return res.status(500).send({ message: err });
            if (!transaction) return res.status(404).send({ message: "Transaction not found." });
            res.json(transaction);
        });
}

// Get all transactions
exports.viewAllTransactions = async (req, res) => {
    Transaction.find()
        .populate("user_seller", "-__v")
        .populate("user_buyer", "-__v")
        .populate("item", "-__v")
        .populate("seller", "-__v")
        .exec((err, transactions) => {
            if (err) return res.status(500).send({ message: err });
            if (!transactions) return res.status(404).send({ message: "Transactions not found." });
            res.json(transactions);
        });
};

// Get transactions by buyer id
exports.getBuyerTransactions = async (req, res) => {
    Transaction.find({
        user_buyer: req.params.id
    })
        .populate("user_seller", "-__v")
        .populate("user_buyer", "-__v")
        .populate("item", "-__v")
        .populate("seller", "-__v")
        .exec((err, transactions) => {
            if (err) return res.status(500).send({ message: err });
            if (!transactions) return res.status(404).send({ message: "Transactions not found." });
            res.json(transactions);
        });
};

// Get transactions by seller id
exports.getSellerTransactions = async (req, res) => {
    Transaction.find({
        user_seller: req.params.id
    })
        .populate("user_seller", "-__v")
        .populate("user_buyer", "-__v")
        .populate("item", "-__v")
        .populate("seller", "-__v")
        .exec((err, transactions) => {
            if (err) return res.status(500).send({ message: err });
            if (!transactions) return res.status(404).send({ message: "Transactions not found." });
            res.json(transactions);
        });
};

// Get transactions by item id
exports.getItemTransactions = async (req, res) => {
    Transaction.find({
        item: req.params.id
    })
        .populate("user_seller", "-__v")
        .populate("user_buyer", "-__v")
        .populate("item", "-__v")
        .populate("seller", "-__v")
        .exec((err, transactions) => {
            if (err) return res.status(500).send({ message: err });
            if (!transactions) return res.status(404).send({ message: "Transactions not found." });
            res.json(transactions);
        });
};

// Post a new transaction
exports.createTransaction = async (req, res) => {
    // check if user same item in transaction and is ongoing
    try {
        const transaction = await Transaction.findOne({
            item: req.body.itemid,
            user_buyer: req.body.userid,
            status: "Pending"
        }).exec();

        if (transaction) return res.status(401).send({ message: "Transaction already exists!" });
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    // find user and item in database to see if it exists
    let user = null;
    try {
        user = await User.findById(req.body.userid)
            .exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    // if item is found in cart, remove it
    const itemIndexInCart = user.cart.indexOf(req.body.itemid);
    if (itemIndexInCart > -1) user.cart.splice(itemIndexInCart, 1);

    // add transaction to database
    try {
        await user.save();
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    let item = null;
    try {
        item = await Item.findById(req.body.itemid).exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!item) return res.status(404).send({ message: "Item not found." });

    const currentDate = new Date();
    let datePlus2Weeks = new Date();
    datePlus2Weeks.setDate(datePlus2Weeks.getDate() + 2 * 7);   // add 2 weeks to date

    // create transaction object
    const transaction = new Transaction({
        user_seller: item.seller,
        user_buyer: user._id,
        item: item._id,
        created_date: currentDate,
        expirational_date: datePlus2Weeks,
        status: "Pending"
    });

    // add transaction to database
    try {
        await transaction.save();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    res.status(200).send({ message: "Transaction created successfully!" });
}

// Delete transaction
exports.deleteTransaction = async (req, res) => {
    Transaction.deleteOne({
        _id: req.params.id
    }, (err, deleted) => {
        if (err) return res.status(500).send({ message: err });
        if (deleted) res.status(200).send({ message: "Transaction successfully removed" });
    });
}

// Cancel transaction, set status to cancelled
exports.cancelTransaction = async (req, res) => {
    let transaction = null;
    try {
        transaction = await Transaction.findOne({
            user_buyer: req.body.userid,
            item: req.body.itemid,
            status: "Pending"
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!transaction) return res.status(401).send({ message: "Transaction not found." });

    transaction.status = "Cancelled";
    try {
        await transaction.save();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    res.status(200).send({ message: "Transaction cancelled successfully!" });
}

// Edit transaction status to "Done"
exports.completeTransaction = async (req, res) => {
    let transaction = null;
    try {
        transaction = await Transaction.findById(req.params.id);
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!transaction) return res.status(401).send({ message: "Transaction not found." });
    
    // add the buyer to transaction
    transaction.finalization_date = new Date();
    transaction.status = "Done";

    // update item in database
    transaction.save(err => {
        if (err) return res.status(500).send({ message: err });
        res.status(200).send({ message: "Transaction completed!" });
    });
};

// Edit to expire