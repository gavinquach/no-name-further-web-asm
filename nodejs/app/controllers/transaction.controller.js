const model = require("../models");
const User = model.user;
const Item = model.item;
const Transaction = model.transaction;

// Get transaction by Id
exports.getTransaction = async (req, res) => {
    let transaction = null;
    try {
        transaction = await Transaction.findById(req.params.id)
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("seller", "-__v")
            .exec();

    } catch (err) {
        return res.status(500).send(err);
    }
    if (!transaction) return res.status(404).send({ message: "Transaction not found." });

    if (transaction.status === "Pending") {
        // set transaction to expired if expiration date is before or equal to current date
        if (transaction.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(transaction.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(transaction);
}

// Get all transactions
exports.viewAllTransactions = async (req, res) => {
    let transactions = [];
    try {
        transactions = await Transaction.find()
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("seller", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (transactions.length < 1) return res.status(404).send({ message: "Transactions not found." });

    // set transaction to expired if expiration date is before or equal to current date
    for (const transaction of transactions) {
        if (transaction.status != "Pending") continue;
        if (transaction.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(transaction.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(transactions);
};

// Get transactions by buyer id
exports.getBuyerTransactions = async (req, res) => {
    let transactions = [];
    try {
        transactions = await Transaction.find({
            user_buyer: req.params.id
        })
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("seller", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (transactions.length < 1) return res.status(404).send({ message: "Transactions not found." });

    // set transaction to expired if expiration date is before or equal to current date
    for (const transaction of transactions) {
        if (transaction.status != "Pending") continue;
        if (transaction.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(transaction.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(transactions);
};

// Get transactions by seller id
exports.getSellerTransactions = async (req, res) => {
    let transactions = [];
    try {
        transactions = await Transaction.find({
            user_seller: req.params.id
        })
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("seller", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (transactions.length < 1) return res.status(404).send({ message: "Transactions not found." });

    // set transaction to expired if expiration date is before or equal to current date
    for (const transaction of transactions) {
        if (transaction.status != "Pending") continue;
        if (transaction.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(transaction.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(transactions);
};

// Get transactions by item id
exports.getItemTransactions = async (req, res) => {
    let transactions = [];
    try {
        transactions = await Transaction.find({
            item: req.params.id
        })
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("seller", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (transactions.length < 1) return res.status(404).send({ message: "Transactions not found." });

    // set transaction to expired if expiration date is before or equal to current date
    for (const transaction of transactions) {
        if (transaction.status != "Pending") continue;
        if (transaction.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(transaction.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(transactions);
};

// Post a new transaction
exports.createTransaction = async (req, res) => {
    // check if transaction is already available
    try {
        const transaction = await Transaction.findOne({
            item: req.body.itemid,
            user_buyer: req.body.userid,
            status: "Pending"
        }).exec();

        if (transaction) return res.status(401).send({ message: "Transaction already exists!" });
    } catch (err) {
        return res.status(500).send(err);
    }

    // find user and item in database to see if it exists
    let user = null;
    let item = null;
    try {
        user = await User.findById(req.body.userid).exec();
        item = await Item.findById(req.body.itemid).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "User not found." });
    if (!item) return res.status(404).send({ message: "Item not found." });

    // if item is found in cart, remove it
    const itemIndexInCart = user.cart.indexOf(req.body.itemid);
    if (itemIndexInCart > -1) user.cart.splice(itemIndexInCart, 1);

    // add 1 to offers in item model
    item.offers += 1;

    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 48);

    // create transaction object
    const transaction = new Transaction({
        user_seller: item.seller,
        user_buyer: user._id,
        item: item._id,
        creation_date: currentDate,
        expiration_date: expiryDate,
        status: "Pending"
    });

    // add transaction and expire transaction to database
    try {
        await item.save();
        await user.save();
        await transaction.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Transaction created successfully!" });
}

// Delete transaction
exports.deleteTransaction = (req, res) => {
    Transaction.findByIdAndRemove(req.params.id,
        async (err, transaction) => {
            if (err) return res.status(500).send(err);
            if (!transaction) return res.status(404).send({ message: "Transaction not found." });

            let item = null;
            try {
                item = await Item.findById(transaction.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;
            // save item
            try {
                await item.save();
            } catch (err) {
                return res.status(500).send(err);
            }
            res.status(200).send({ message: "Transaction successfully removed" });
        });
}

// Cancel transaction, set status to cancelled
exports.cancelTransaction = async (req, res) => {
    let transaction = null;
    let item = null;
    try {
        transaction = await Transaction.findOne({
            user_buyer: req.body.userid,
            item: req.body.itemid,
            status: "Pending"
        });
        item = await Item.findById(transaction.item).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!transaction) return res.status(401).send({ message: "Transaction not found." });
    if (!item) return res.status(404).send({ message: "Item not found." });

    // remove 1 from offers in item model
    item.offers -= 1;

    // save item, delete expiration document, and update transaction in database
    try {
        await item.save();
        transaction.status = "Cancelled";
        await transaction.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Transaction cancelled successfully!" });
}

// set transaction to finished
exports.setTransactionToFinished = async (req, res) => {
    let transaction = null;
    try {
        transaction = await Transaction.findById(req.params.id);
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!transaction) return res.status(404).send({ message: "Transaction not found." });

    // delete expiration document and update transaction in database
    try {
        transaction.finalization_date = new Date();
        transaction.status = "Finished";
        await transaction.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Transaction completed!" });
};

// set transaction to expired
exports.setTransactionToExpired = async (req, res) => {
    let transaction = null;
    let expiredId = null;
    let item = null;

    // Get the expirational Id from the transaction object
    try {
        item = await Item.findById(transaction.item).exec();
        transaction = await Transaction.findById(req.params.id);
        expiredId = transaction.expiration_date;
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!transaction) return res.status(404).send({ message: "Transaction not found." });
    if (!item) return res.status(404).send({ message: "Item not found." });

    if (transaction.expiration_date <= new Date()) {
        // remove 1 from offers in item model
        item.offers -= 1;
        transaction.status = "Expired";

        try {
            await item.save();
            await transaction.save();
        } catch (err) {
            return res.status(500).send(err);
        }

        res.status(200).send({ message: "Transaction set to expired Successfully!" });
    }
}