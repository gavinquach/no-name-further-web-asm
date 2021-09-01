const model = require("../models");
const Image = model.image;
const Item = model.item;
const ItemCategory = model.itemCategory;
const Transaction = model.transaction;
const User = model.user;

const img = require("../config/img.config");
const fs = require("fs");
const uploadFile = require("../middlewares/storeImage");
const { match } = require("assert");




exports.createItem = async (req, res) => {
    try {
        await uploadFile.multiple(req, res);
    } catch (err) {
        return res.status(500).send(err);
    }

    // validate username
    if (!req.body.userid) return res.status(500).send({ message: "Invalid user." });

    let user = null;

    // find username in database to see if it exists
    try {
        user = await User.findById(req.body.userid).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    let categories = [];
    try {
        categories = await ItemCategory.find().exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!categories) return res.status(404).send({ message: "Item categories not found!" });

    const itemObj = JSON.parse(req.body.item);
    let itemType = null;
    let forItemType = null;
    categories.map(category => {
        if (category.name === itemObj.type) {
            itemType = category._id;
        }
        if (category.name === itemObj.forItemType) {
            forItemType = category._id;
        }
    });

    if (itemType === null || forItemType === null) {
        return res.status(404).send({ message: "Invalid item category." });
    }

    // create item object from array passed through
    const date = new Date();
    const item = new Item({
        name: itemObj.name,
        quantity: itemObj.quantity,
        type: itemType,
        images: [],
        forItemName: itemObj.forItemName,
        forItemQty: itemObj.forItemQty,
        forItemType: forItemType,
        seller: user._id,
        upload_date: date,
        last_update: date
    });

    // ======================== validate images ========================
    if (req.files === undefined) {
        return res.status(404).send({ message: "Incorrect file type or file not found!" });
    }
    let newImages = { coverCount: 0, normalCount: 0 };
    const parsedCoverIndexes = JSON.parse(req.body.coverIndexes);

    parsedCoverIndexes.map(isCover => {
        if (isCover) newImages.coverCount++;
        else newImages.normalCount++;
    });

    if (newImages.coverCount + newImages.normalCount != req.files.length) {
        return res.status(500).send({ message: "Error processing images, please re-upload them and try again." });
    }

    if (newImages.coverCount + newImages.normalCount < 1) {
        return res.status(400).send({ message: "Please upload at least 1 cover and 1 item image!" });
    }
    if (newImages.coverCount > 1) {
        return res.status(400).send({ message: "Invalid amount of cover images!" });
    }
    if (newImages.coverCount < 1) {
        return res.status(400).send({ message: "Please upload at least 1 cover image!" });
    }
    if (newImages.normalCount < 1) {
        return res.status(400).send({ message: "Please upload at least 1 item image!" });
    }
    // ======================== end of validate images ========================

    // create list of image objects from the array passed through
    const images = [];
    req.files.map((image, index) => {
        images.push(new Image({
            name: image.filename,
            size: image.size,
            type: image.mimetype,
            item: item._id,
            cover: parsedCoverIndexes[index]
        }));
    });

    // add images to database
    images.map(async image => {
        try {
            image.save();
        } catch (err) {
            if (err) return res.status(500).send(err);
        }

        // add image id to item's list of images
        item.images.push(image._id);
    });

    // add item to database
    try {
        item.save();
    } catch (err) {
        if (err) return res.status(500).send(err);
    }

    // add items to user items field
    user.items.push(item._id);

    // update user
    try {
        user.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.send({ message: "Item created successfully!" });
};

exports.editItem = async (req, res) => {
    try {
        await uploadFile.multiple(req, res);
    } catch (err) {
        return res.status(500).send(err);
    }

    let item = null;
    try {
        item = await Item.findById(req.params.id)
            .populate("type", "-__v")
            .populate("forItemType", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!item) return res.status(404).send({ message: "Item not found!" });

    let categories = [];
    try {
        categories = await ItemCategory.find().exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (categories.length < 1) return res.status(404).send({ message: "Item categories not found!" });

    const itemObj = JSON.parse(req.body.item);
    let itemType = null;
    let forItemType = null;
    categories.map(category => {
        if (category.name === itemObj.type) {
            itemType = category._id;
        }
        if (category.name === itemObj.forItemType) {
            forItemType = category._id;
        }
    });

    if (itemType === null || forItemType === null) {
        return res.status(400).send({ message: "Invalid item category." });
    }

    // ======================== validate images ========================
    if (req.files === undefined) {
        return res.status(404).send({ message: "Incorrect file type or file not found!" });
    }

    let currentImages = { coverCount: 0, normalCount: 0 };
    for (const imageid of item.images) {
        const image = await Image.findById(imageid).exec();
        if (image.cover) currentImages.coverCount++;
        else currentImages.normalCount++;
    };

    let removedImages = { coverCount: 0, normalCount: 0 };
    const parsedRemovedImages = JSON.parse(req.body.removedImages);
    parsedRemovedImages.map(image => {
        if (image.cover) removedImages.coverCount++;
        else removedImages.normalCount++;
    });

    let newImages = { coverCount: 0, normalCount: 0 };
    const parsedCoverIndexes = JSON.parse(req.body.coverIndexes);

    parsedCoverIndexes.map(isCover => {
        if (isCover) newImages.coverCount++;
        else newImages.normalCount++;
    });

    if (newImages.coverCount + newImages.normalCount != req.files.length) {
        return res.status(500).send({ message: "Error processing images, please re-upload them and try again." });
    }

    const finalImages = {
        coverCount: currentImages.coverCount - removedImages.coverCount + newImages.coverCount,
        normalCount: currentImages.normalCount - removedImages.normalCount + newImages.normalCount
    }

    if (finalImages.coverCount + finalImages.normalCount < 1) {
        return res.status(400).send({ message: "Please upload at least 1 cover and 1 item image!" });
    }
    if (finalImages.coverCount < 1) {
        return res.status(400).send({ message: "Please upload at least 1 cover image!" });
    }
    if (finalImages.normalCount < 1) {
        return res.status(400).send({ message: "Please upload at least 1 item image!" });
    }
    // ======================== end of validate images ========================

    // create list of image objects
    const images = [];
    req.files.map((image, index) => {
        images.push(new Image({
            name: image.filename,
            size: image.size,
            type: image.mimetype,
            item: item._id,
            cover: parsedCoverIndexes[index]
        }));
    });

    // remove old images from database and files
    parsedRemovedImages.map(image => {
        fs.unlink(img.path.concat(image.name), err => {
            // if (err) return res.status(500).send(err);
        });

        // remove images from item database
        const imageIndex = item.images.indexOf(image._id);
        if (imageIndex > -1) {
            item.images.splice(imageIndex, 1);
        }

        Image.deleteOne({ _id: image._id });
    });

    // assign item data to the sent request
    item.name = itemObj.name;
    item.quantity = itemObj.quantity;
    item.type = itemType;
    item.forItemName = itemObj.forItemName;
    item.forItemQty = itemObj.forItemQty;
    item.forItemType = forItemType;
    item.last_update = new Date();

    // add new images to database
    images.map(async image => {
        image.save();
        // add image id to item's list of images
        item.images.push(image._id);
    });

    // update item in database
    try {
        await item.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Item updated successfully!" });
};

exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;
    let item = null;
    try {
        item = await Item.findById(itemId)
            .populate("images", "-__v")
            .populate("seller", "-__v")
            .exec()
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!item) return res.status(404).send({ message: "Item not found." });

    // remove images related to item
    item.images.map(image => {
        fs.unlink(img.path.concat(image.name), err => {
            // if (err) return res.status(500).send(err);
        });
        Image.deleteOne({ _id: image.id });
    });

    const user = item.seller;

    // remove item from user items array
    const index = user.items.indexOf(itemId);
    if (index > -1) user.items.splice(index, 1);

    // update user on database
    try {
        user.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    // ============= cancel all transactions with item =============
    let transactions = [];
    try {
        transactions = await Transaction.find({
            item: itemId, status: "Pending"
        }).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!transactions) return res.status(401).send({ message: "Transaction not found." });

    // set status of all transactions of item to cancelled
    transactions.map(async transaction => {
        try {
            transaction.status = "Cancelled";
            transaction.save();
        } catch (err) {
            return res.status(500).send(err);
        }
    });

    // ============= end of cancel all transactions with item =============

    // finally, remove item from database
    try {
        await Item.deleteOne({ _id: itemId });
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Item successfully removed" });
};




exports.getItem = async (req, res) => {
    Item.findById({
        _id: req.params.id
    })
        .populate("type", "-__v")
        .populate("forItemType", "-__v")
        .populate("images", "-__v")
        .populate("seller", "-__v")
        .exec((err, item) => {
            if (err) return res.status(500).send(err);
            if (!item) return res.status(404).send({ message: "Item not found." });
            res.json(item);
        });
};

// ============= Duong Work for Advanced API  =============
// Duong'version with Pagination/ Filtering / Sorting  from Duong development branch

// Create API Features object to implement in other model if needed 
// WARNING : In sort method, the default sort by -upload_date / the variables in item model
// -> if use this object later with other models , create upload_date in other model too or set some default created time for each model
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1. Filtering 
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach(el => delete queryObj[el]);


        // 2. Advanced Filtering with greater, greater equal, less than , less and equal
        let queryStr = JSON.stringify(queryObj);
        // Replace all case with new string including $ sign before for mongoose query
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);


        // initialize query based on param
        this.query = this.query.find(JSON.parse(queryStr))

        return this;
    }

    sort() {

        //3. Sorting 
        if (this.queryString.sort) {
            // split elements to sort 
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-upload_date');
        }

        return this;

    }


    limitFields() {
        //4 Field Limiting 
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }


    paginate() {
        // 5 Pagination with param page, and limit set 
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        
        return this;
    }
}

// This is Alias to shorten URL, standard mechanism instead of customed Params
// Can be applied to other features such as Least Quantity, Most Transaction, ... based on use cases later
// Most Quantity and For Item quantity to least // Limit to 6 items
exports.aliasTopItemQuantity = (req, res, next) => {
    req.query.limit = "6";
    req.query.sort = "-quantity,-forItemQty"
    req.query.fields = "name,quantity,forItemQty,forItemName"
    next();
}


// Advanced Get All items with Pagination/ Filtering / Sorting 
exports.getAllItems = async (req, res) => {
    try {

        // Execute query from Feature API object
        const features = new APIFeatures(
            Item.find().populate("type", "-__v")
                .populate("forItemType", "-__v")
                .populate("images", "-__v")
                .populate("seller", "-__v"),
            req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const items = await features.query;


        if (!items) return res.status(404).send({ message: "Item not found." });
        await res.status(200).json({
            status: "success",
            result: items.length,
            data: {
                items
            }
        });
    } catch (err) {
        
        res.status(404).json({
            status: "fail",
            message: console.log(err)
        });
    }
};



