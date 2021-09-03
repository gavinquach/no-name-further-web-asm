const model = require("../models");
const User = model.user;
const Item = model.item;
const Transaction = model.transaction;
const ExpiredTransaction = model.expiredTransaction;

// Get transaction by Id
exports.getTransaction = async (req, res) => {
    Transaction.findById({
        _id: req.params.id
    })
        .populate("user_seller", "-__v")
        .populate("user_buyer", "-__v")
        .populate("item", "-__v")
        .populate("seller", "-__v")
        .populate("expiration_date", "-__v")
        .exec(async (err, transaction) => {
            if (err) return res.status(500).send(err);
            if (!transaction) return res.status(404).send({ message: "Transaction not found." });

            // set transaction to expired if can't find the expiration transaction entry in database
            if (!transaction.expiration_date) {
                try {
                    transaction.status = "Expired";
                    await transaction.save();
                } catch (err) {
                    return res.status(500).send(err);
                }
            } else {
                let expiredTransaction = null;
                try {
                    expiredTransaction = await ExpiredTransaction.findById(transaction.expiration_date._id);
                } catch (err) {
                    return res.status(500).send(err);
                }

                if (!expiredTransaction) {
                    try {
                        transaction.status = "Expired";
                        await transaction.save();
                    } catch (err) {
                        return res.status(500).send(err);
                    }
                }
            }
            res.json(transaction);
        });
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
            .populate("expiration_date", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (transactions.length < 1) return res.status(404).send({ message: "Transactions not found." });

    // set transaction to expired if can't find the expiration transaction entry in database
    for (const transaction of transactions) {
        if (!transaction.expiration_date) {
            try {
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        } else {
            let expiredTransaction = null;
            try {
                expiredTransaction = await ExpiredTransaction.findById(transaction.expiration_date._id);
            } catch (err) {
                return res.status(500).send(err);
            }

            if (!expiredTransaction) {
                try {
                    transaction.status = "Expired";
                    await transaction.save();
                } catch (err) {
                    return res.status(500).send(err);
                }
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
            .populate("expiration_date", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (transactions.length < 1) return res.status(404).send({ message: "Transactions not found." });

    // set transaction to expired if can't find the expiration transaction entry in database
    for (const transaction of transactions) {
        if (!transaction.expiration_date) {
            try {
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        } else {
            let expiredTransaction = null;
            try {
                expiredTransaction = await ExpiredTransaction.findById(transaction.expiration_date._id);
            } catch (err) {
                return res.status(500).send(err);
            }

            if (!expiredTransaction) {
                try {
                    transaction.status = "Expired";
                    await transaction.save();
                } catch (err) {
                    return res.status(500).send(err);
                }
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
            .populate("expiration_date", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (transactions.length < 1) return res.status(404).send({ message: "Transactions not found." });

    // set transaction to expired if can't find the expiration transaction entry in database
    for (const transaction of transactions) {
        if (!transaction.expiration_date) {
            try {
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        } else {
            let expiredTransaction = null;
            try {
                expiredTransaction = await ExpiredTransaction.findById(transaction.expiration_date._id);
            } catch (err) {
                return res.status(500).send(err);
            }

            if (!expiredTransaction) {
                try {
                    transaction.status = "Expired";
                    await transaction.save();
                } catch (err) {
                    return res.status(500).send(err);
                }
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
            .populate("expiration_date", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (transactions.length < 1) return res.status(404).send({ message: "Transactions not found." });

    // set transaction to expired if can't find the expiration transaction entry in database
    for (const transaction of transactions) {
        if (!transaction.expiration_date) {
            try {
                transaction.status = "Expired";
                await transaction.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        } else {
            let expiredTransaction = null;
            try {
                expiredTransaction = await ExpiredTransaction.findById(transaction.expiration_date._id);
            } catch (err) {
                return res.status(500).send(err);
            }

            if (!expiredTransaction) {
                try {
                    transaction.status = "Expired";
                    await transaction.save();
                } catch (err) {
                    return res.status(500).send(err);
                }
            }
        }
    }
    res.json(transactions);
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
        return res.status(500).send(err);
    }

    // find user and item in database to see if it exists
    let user = null;
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

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 48);

    // create expired transaction object
    const expiredTransaction = new ExpiredTransaction({
        createdAt: currentDate,
        expiredAt: expiryDate
    });

    // create transaction object
    const transaction = new Transaction({
        user_seller: item.seller,
        user_buyer: user._id,
        item: item._id,
        creation_date: currentDate,
        expiration_date: expiredTransaction,
        status: "Pending"
    });

    expiredTransaction.transaction = transaction;

    // add transaction and expire transaction to database
    try {
        await transaction.save();
        await expiredTransaction.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Transaction created successfully!" });
}

// Create expire transaction
exports.createExpiredTransaction = async (id) => {

}

// Delete transaction
exports.deleteTransaction = async (req, res) => {
    Transaction.deleteOne({
        _id: req.params.id
    }, (err, deleted) => {
        if (err) return res.status(500).send(err);
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
        return res.status(500).send(err);
    }
    if (!transaction) return res.status(401).send({ message: "Transaction not found." });

    transaction.status = "Cancelled";
    try {
        await transaction.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Transaction cancelled successfully!" });
}

// Edit transaction status to "Done"
exports.completeTransaction = async (req, res) => {
    let transaction = null;
    try {
        transaction = await Transaction.findById(req.params.id);
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!transaction) return res.status(404).send({ message: "Transaction not found." });

    // add the buyer to transaction
    transaction.finalization_date = new Date();
    transaction.status = "Finished";

    // update item in database
    try {
        await transaction.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Transaction completed!" });
};

// Edit to expire
exports.expireTransaction = async (req, res) => {
    let transaction = null;
    let expiredId = null;

    // Get the expirational Id from the transaction object
    try {
        transaction = await Transaction.findById(req.params.id);
        expiredId = transaction.expiration_date;
    } catch (err) {
        return res.status(500).send(err);
    }

    // Find the expiredTransaction object
    let expiredTransaction = null;
    try {
        expiredTransaction = await ExpiredTransaction.findById(expiredId);
    } catch (err) {
        return res.status(500).send(err);
    }

    // If cannot be found, edit the transaction to expired
    if (expiredTransaction) {
        res.status(403).send({ message: "Transaction is still on-going!" });
    }

    try {
        transaction.status = "Expired";
        await transaction.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Transaction set to expired Successfully!" });
}