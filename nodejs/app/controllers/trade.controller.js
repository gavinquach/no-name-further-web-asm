const model = require("../models");
const User = model.user;
const Item = model.item;
const Trade = model.trade;

// Get trade by Id
exports.getTrade = async (req, res) => {
    let trade = null;
    try {
        trade = await Trade.findById(req.params.id)
            .populate("user_seller", "-__v")
            .populate("user_buyer", "-__v")
            .populate("item", "-__v")
            .populate("seller", "-__v")
            .exec();

    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trade) return res.status(404).send({ message: "Trade not found." });

    if (trade.status === "Pending") {
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
                trade.status = "Expired";
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
            .populate("seller", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (trades.length < 1) return res.status(404).send({ message: "Trades not found." });

    // set trade to expired if expiration date is before or equal to current date
    for (const trade of trades) {
        if (trade.status != "Pending") continue;
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
                trade.status = "Expired";
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
    try {
        trades = await Trade.find({
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
    if (trades.length < 1) return res.status(404).send({ message: "Trades not found." });

    // set trade to expired if expiration date is before or equal to current date
    for (const trade of trades) {
        if (trade.status != "Pending") continue;
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
                trade.status = "Expired";
                await trade.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        }
    }
    res.json(trades);
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
            .populate("seller", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (trades.length < 1) return res.status(404).send({ message: "Trades not found." });

    // set trade to expired if expiration date is before or equal to current date
    for (const trade of trades) {
        if (trade.status != "Pending") continue;
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
                trade.status = "Expired";
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
            .populate("seller", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (trades.length < 1) return res.status(404).send({ message: "Trades not found." });

    // set trade to expired if expiration date is before or equal to current date
    for (const trade of trades) {
        if (trade.status != "Pending") continue;
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
                trade.status = "Expired";
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
        const trade = await Trade.findOne({
            item: req.body.itemid,
            user_buyer: req.body.userid,
            status: "Pending"
        }).exec();

        if (trade) return res.status(401).send({ message: "Trade already exists!" });
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

    // add 1 to offers in item model
    item.offers += 1;

    const currentDate = new Date();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 48);

    // create trade object
    const trade = new Trade({
        user_seller: item.seller,
        user_buyer: user._id,
        item: item._id,
        creation_date: currentDate,
        expiration_date: expiryDate,
        status: "Pending"
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

            // remove 1 from offers in item model
            item.offers -= 1;
            // save item
            try {
                await item.save();
            } catch (err) {
                return res.status(500).send(err);
            }
            res.status(200).send({ message: "Trade removed successfully" });
        });
}

// Cancel trade, set status to cancelled
exports.cancelTrade = async (req, res) => {
    let trade = null;
    let item = null;
    try {
        trade = await Trade.findOne({
            user_buyer: req.body.userid,
            item: req.body.itemid,
            status: "Pending"
        });
        item = await Item.findById(trade.item).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trade) return res.status(401).send({ message: "Trade not found." });
    if (!item) return res.status(404).send({ message: "Item not found." });

    // remove 1 from offers in item model
    item.offers -= 1;

    // save item, delete expiration document, and update trade in database
    try {
        await item.save();
        trade.status = "Cancelled";
        await trade.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Trade cancelled successfully!" });
}

// set trade to finished
exports.setTradeToFinished = async (req, res) => {
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
        trade.status = "Finished";
        await trade.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send({ message: "Trade completed!" });
};

// set trade to expired
exports.setTradeToExpired = async (req, res) => {
    let trade = null;
    let expiredId = null;
    let item = null;

    // Get the expirational Id from the trade object
    try {
        item = await Item.findById(trade.item).exec();
        trade = await Trade.findById(req.params.id);
        expiredId = trade.expiration_date;
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trade) return res.status(404).send({ message: "Trade not found." });
    if (!item) return res.status(404).send({ message: "Item not found." });

    if (trade.expiration_date <= new Date()) {
        // remove 1 from offers in item model
        item.offers -= 1;
        trade.status = "Expired";

        try {
            await item.save();
            await trade.save();
        } catch (err) {
            return res.status(500).send(err);
        }

        res.status(200).send({ message: "Trade set to expired successfully!" });
    }
}