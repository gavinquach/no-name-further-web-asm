const model = require("../models");
const User = model.user;
const Item = model.item;
const Trade = model.trade;
const APIFeatures = require("./apiFeature");

// Get trade by Id
exports.getTrade = async (req, res) => {
    let trade = null;
    try {
        trade = await Trade.findById(req.params.id)
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("cancel_user", "-__v")
            .exec();

    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trade) return res.status(404).send({ message: "Trade not found." });

    if (trade.status == "PENDING" || trade.status == "WAITING_APPROVAL") {
        // set trade to expired if expiration date is before or equal to current date
        if (trade.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(trade.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                trade.status = "EXPIRED";
                await trade.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(trade);
}

// Get all trades
exports.getAllTrades = async (req, res) => {
    let trades = [];
    try {
        trades = await Trade.find()
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("cancel_user", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (trades.length < 1) return res.status(404).send({ message: "Trades not found." });

    // set trade to expired if expiration date is before or equal to current date
    for (const trade of trades) {
        if (trade.status != "PENDING" && trade.status != "WAITING_APPROVAL") continue;
        if (trade.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(trade.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                trade.status = "EXPIRED";
                await trade.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(trades);
};

// Get trades by buyer id
exports.getBuyerTrades = async (req, res) => {
    let trades = [];
    let total = 0;
    let status = req.query.status;

    try {
        let features = null;
        if (status == "REQUESTS") {
            features = new APIFeatures(
                Trade.find({
                    status: "WAITING_APPROVAL",
                    user_seller: req.params.id
                })
                    .populate("user_seller", "-__v")
                    .populate("user_buyer", "-__v")
                    .populate("item", "-__v")
                    .populate("cancel_user", "-__v")
                , req.query)
                .filter()
                .sort();
        } else {
            features = new APIFeatures(
                Trade.find({
                    status: req.query.status
                })
                    .populate("user_seller", "-__v")
                    .populate("user_buyer", "-__v")
                    .populate("item", "-__v")
                    .populate("cancel_user", "-__v")
                , req.query)
                .filter()
                .sort();
        }

        //count retrieved total data before pagination
        total = await Trade.countDocuments(features.query);

        // paginating data
        trades = await features.paginate().query;

        if (!trades || trades.length < 1) return res.status(404).send({ message: "Trades not found." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        // set trade to expired if expiration date is before or equal to current date
        for (const trade of trades) {
            if (trade.status != "PENDING" && trade.status != "WAITING_APPROVAL") continue;
            if (trade.expiration_date <= new Date()) {
                let item = null;
                try {
                    item = await Item.findById(trade.item).exec();
                } catch (err) {
                    return res.status(500).send(err);
                }
                if (!item) return res.status(404).send({ message: "Item not found." });

                // remove 1 from offers in item model
                item.offers -= 1;

                try {
                    await item.save();
                    trade.status = "EXPIRED";
                    await trade.save();
                } catch (err) {
                    return res.status(500).send(err);
                }
            }
        }

        res.status(200).json({
            totalResults: total,
            result: trades.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            trades: trades
        });
    } catch (err) {
        return res.status(500).send(err);
    }
};

// Get trades by seller id
exports.getSellerTrades = async (req, res) => {
    let trades = [];
    try {
        trades = await Trade.find({
            user_seller: req.params.id
        })
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("cancel_user", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (trades.length < 1) return res.status(404).send({ message: "Trades not found." });

    // set trade to expired if expiration date is before or equal to current date
    for (const trade of trades) {
        if (trade.status != "PENDING" && trade.status != "WAITING_APPROVAL") continue;
        if (trade.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(trade.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                trade.status = "EXPIRED";
                await trade.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(trades);
};

// Get trades by item id
exports.getItemTrades = async (req, res) => {
    let trades = [];
    try {
        trades = await Trade.find({
            item: req.params.id
        })
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("cancel_user", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (trades.length < 1) return res.status(404).send({ message: "Trades not found." });

    // set trade to expired if expiration date is before or equal to current date
    for (const trade of trades) {
        if (trade.status != "PENDING" && trade.status != "WAITING_APPROVAL") continue;
        if (trade.expiration_date <= new Date()) {
            let item = null;
            try {
                item = await Item.findById(trade.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove 1 from offers in item model
            item.offers -= 1;

            try {
                await item.save();
                trade.status = "EXPIRED";
                await trade.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(trades);
};

// Post a new trade
exports.createTrade = async (req, res) => {
    // check if trade is already available
    try {
        let trade = await Trade.findOne({
            item: req.body.itemid,
            user_buyer: req.body.userid,
            status: "PENDING"
        }).exec();
        if (trade) return res.status(401).send({ message: "Trade already exists!" });

        trade = await Trade.findOne({
            item: req.body.itemid,
            user_buyer: req.body.userid,
            status: "WAITING_APPROVAL"
        }).exec();

        if (trade) return res.status(401).send({ message: "Trade is awaiting approval!" });
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

    // user is the owner of item
    if (item.seller == user._id) {
        return res.status(403).send({ message: "Can't trade with your own item!" });
    }

    // if item is found in cart, remove it
    const itemIndexInCart = user.cart.indexOf(req.body.itemid);
    if (itemIndexInCart > -1) user.cart.splice(itemIndexInCart, 1);

    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 48);

    // create trade object
    const trade = new Trade({
        user_seller: item.seller,
        user_buyer: user._id,
        item: item._id,
        expiration_date: expiryDate,
        status: "WAITING_APPROVAL"
    });

    // add trade and expire trade to database
    try {
        await item.save();
        await user.save();
        await trade.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({
        message: "Trade created successfully!",
        trade: trade,
        item: item
    });
}

// Delete trade
exports.deleteTrade = (req, res) => {
    Trade.findByIdAndRemove(req.params.id,
        async (err, trade) => {
            if (err) return res.status(500).send(err);
            if (!trade) return res.status(404).send({ message: "Trade not found." });

            let item = null;
            try {
                item = await Item.findById(trade.item).exec();
            } catch (err) {
                return res.status(500).send(err);
            }
            if (!item) return res.status(404).send({ message: "Item not found." });

            // save item
            try {
                // remove 1 from offers in item model
                item.offers -= 1;
                await item.save();
            } catch (err) {
                return res.status(500).send(err);
            }
            res.status(200).send({ message: "Trade removed successfully" });
        });
}

// Cancel trade, set status to "CANCELLED"
exports.cancelTrade = async (req, res) => {
    let trade = null;
    let item = null;
    try {
        trade = await Trade.findOne({
            user_seller: req.body.userid,
            item: req.body.itemid,
            status: { $in: ["PENDING", "WAITING_APPROVAL"] }
        });

        if (!trade) {
            trade = await Trade.findOne({
                user_buyer: req.body.userid,
                item: req.body.itemid,
                status: { $in: ["PENDING", "WAITING_APPROVAL"] }
            });
        }

        item = await Item.findById(trade.item).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!item) return res.status(404).send({ message: "Item not found." });

    // save item, delete expiration document, and update trade in database
    try {
        // remove 1 from offers in item model
        item.offers -= 1;
        await item.save();

        trade.status = "CANCELLED";
        trade.cancel_user = req.body.userid;
        await trade.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Trade cancelled successfully!" });
}

// set trade status to "COMPLETE"
exports.setTradeToComplete = async (req, res) => {
    let trade = null;
    try {
        trade = await Trade.findById(req.params.id);
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trade) return res.status(404).send({ message: "Trade not found." });

    // delete expiration document and update trade in database
    try {
        trade.finalization_date = new Date();
        trade.status = "COMPLETE";
        await trade.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Trade completed!" });
};

// set trade status to EXPIRED
exports.setTradeToExpired = async (req, res) => {
    let trade = null;
    let item = null;

    // Get the expirational Id from the trade object
    try {
        item = await Item.findById(trade.item).exec();
        trade = await Trade.findById(req.params.id);
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trade) return res.status(404).send({ message: "Trade not found." });
    if (!item) return res.status(404).send({ message: "Item not found." });

    if (trade.expiration_date <= new Date()) {
        try {
            // remove 1 from offers in item model
            item.offers -= 1;
            trade.status = "EXPIRED";
            await item.save();
            await trade.save();
        } catch (err) {
            return res.status(500).send(err);
        }

        res.status(200).send({ message: "Trade set to expired successfully!" });
    }
}

// set trade with status "WAITING_APPROVAL" to "PENDING"
exports.approveTrade = async (req, res) => {
    let trade = null;
    try {
        trade = await Trade.findOne({
            _id: req.params.id,
            user_seller: req.body.userid,
            status: "WAITING_APPROVAL"
        });
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trade) return res.status(404).send({ message: "Trade not found." });

    let item = null;
    try {
        item = await Item.findById(trade.item).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!item) return res.status(404).send({ message: "Item not found." });

    if (trade.expiration_date <= new Date()) {
        return res.status(403).send({ message: "Trade already expired." });
    }

    try {
        // update trade expiry date
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 48);
        trade.status = "PENDING";
        trade.expiration_date = expiryDate;
        await trade.save();

        // add 1 to offers in item model
        item.offers += 1;
        await item.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Trade approved successfully!" });
}

// set trades with status "WAITING_APPROVAL" to "DENIED"
exports.denyTrade = async (req, res) => {
    let trade = null;
    try {
        trade = await Trade.findOne({
            _id: req.params.id,
            user_seller: req.body.userid,
            status: "WAITING_APPROVAL"
        });
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trade) return res.status(404).send({ message: "Trade not found." });

    let item = null;
    try {
        item = await Item.findById(trade.item).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!item) return res.status(404).send({ message: "Item not found." });

    if (trade.expiration_date <= new Date()) {
        return res.status(403).send({ message: "Trade already expired." });
    }

    try {
        trade.status = "DENIED";
        await trade.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Trade approved successfully!" });
}