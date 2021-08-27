const model = require("../models");
const Image = model.image;
const Item = model.item;
const ItemCategory = model.itemCategory;
const User = model.user;

const img = require("../config/img.config");
const fs = require("fs");
const uploadFile = require("../middlewares/storeImage");
const { image } = require("../models");

exports.createItem = async (req, res) => {
    try {
        await uploadFile.multiple(req, res);
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    // validate files
    if (req.files === undefined) {
        return res.status(404).send({ message: "Incorrect file type or file not found!" });
    }
    if (Array.isArray(req.body.coverIndexes)) {
        let coverCount = 0;
        let normalCount = 0;
        req.body.coverIndexes.map(isCover => {
            if (isCover === "true") coverCount++;
            else normalCount++;
        });

        if (coverCount > 1) {
            return res.status(400).send({ message: "Invalid amount of cover images!" });
        }
        if (coverCount < 1) {
            return res.status(400).send({ message: "Please upload at least 1 cover image!" });
        }
        if (normalCount < 1) {
            return res.status(400).send({ message: "Please upload at least 1 item image!" });
        }
    } else {
        if (req.body.coverIndexes === "true") {
            return res.status(400).send({ message: "Please upload at least 1 item image!" });
        }
        else if (req.body.coverIndexes === "false") {
            return res.status(400).send({ message: "Please upload at least 1 cover image!" });
        }
    }

    // validate username
    if (!req.body.userid) return res.status(500).send({ message: "Invalid user." });

    let user = null;

    // find username in database to see if it exists
    try {
        user = await User.findById(req.body.userid).exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    let categories = [];
    try {
        categories = await ItemCategory.find().exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!categories) return res.status(404).send({ message: "Item categories not found!" });

    let itemType = null;
    let forItemType = null;
    categories.map(category => {
        if (category.name === req.body.type) {
            itemType = category._id;
        }
        if (category.name === req.body.forItemType) {
            forItemType = category._id;
        }
    });

    if (itemType === null || forItemType === null) {
        return res.status(404).send({ message: "Invalid item category." });
    }

    // create item object from array passed through
    const date = new Date();
    const item = new Item({
        name: req.body.name,
        quantity: req.body.quantity,
        type: itemType,
        images: [],
        forItemName: req.body.forItemName,
        forItemQty: req.body.forItemQty,
        forItemType: forItemType,
        seller: user._id,
        upload_date: date,
        last_update: date
    });

    // create list of image objects from the array passed through
    const images = [];
    req.files.map((image, index) => {
        images.push(new Image({
            name: image.filename,
            size: image.size,
            type: image.mimetype,
            item: item._id,
            cover: req.body.coverIndexes[index]
        }));
    });

    // add images to database
    images.map(image => {
        try {
            image.save();
        } catch (err) {
            if (err) return res.status(500).send({ message: err });
        }

        // add image id to item's list of images
        item.images.push(image._id);
    });

    // add item to database
    try {
        item.save();
    } catch (err) {
        if (err) return res.status(500).send({ message: err });
    }

    // add items to user items field
    user.items.push(item._id);

    // update user
    try {
        user.save();
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    res.send({ message: "Item created successfully!" });
};

exports.editItem = async (req, res) => {
    try {
        await uploadFile.multiple(req, res);
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    let item = null;
    try {
        item = await Item.findById(req.params.id)
            .populate("type", "-__v")
            .populate("forItemType", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!item) return res.status(404).send({ message: "Item not found!" });

    let categories = [];
    try {
        categories = await ItemCategory.find().exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (categories.length < 1) return res.status(404).send({ message: "Item categories not found!" });

    const itemObj = JSON.parse(req.body.item);
    const date = new Date();
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

    // assign item data to the sent request
    item.name = itemObj.name;
    item.quantity = itemObj.quantity;
    item.type = itemType;
    item.forItemName = itemObj.forItemName;
    item.forItemQty = itemObj.forItemQty;
    item.forItemType = forItemType;
    item.last_update = date;

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
    const parsedOldImages = JSON.parse(req.body.oldImages);
    parsedOldImages.map(image => {
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
    parsedOldImages.map(image => {
        fs.unlink(img.path.concat(image.name), err => {
            // if (err) return res.status(500).send({ message: err });
        });

        // remove images from item database
        const imageIndex = item.images.indexOf(image._id);
        if (imageIndex > -1) {
            item.images.splice(imageIndex, 1);
        }

        Image.deleteOne({ _id: image._id });
    });

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
        return res.status(500).send({ message: err });
    }
    res.status(200).send({ message: "Item updated successfully!" });
};

exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;
    Item.findById(itemId)
        .populate("images", "-__v")
        .populate("seller", "-__v")
        .exec((err, item) => {
            if (err) return res.status(500).send({ message: err });
            if (!item) return res.status(404).send({ message: "Item not found." });

            // remove images related to item
            item.images.map(image => {
                fs.unlink(img.path.concat(image.name), err => {
                    // if (err) return res.status(500).send({ message: err });
                });
                Image.deleteOne({ _id: img.id });
            });

            const user = item.seller;

            // remove item from user items array
            user.items.splice(user.items.indexOf(item._id), 1);

            user.save(err => {
                if (err) return res.status(500).send({ message: err });

                // finally, remove item from database
                Item.deleteOne({ _id: itemId }, (err, deleted) => {
                    if (err) return res.status(500).send({ message: err });
                    if (deleted) res.status(200).send('Item successfully removed');
                });
            });
        });
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
            if (err) return res.status(500).send({ message: err });
            if (!item) return res.status(404).send({ message: "Item not found." });
            res.json(item);
        });
};

exports.getAllItems = async (req, res) => {
    Item.find()
        .populate("type", "-__v")
        .populate("forItemType", "-__v")
        .populate("images", "-__v")
        .populate("seller", "-__v")
        .exec((err, items) => {
            if (err) return res.status(500).send({ message: err });
            if (!items) return res.status(404).send({ message: "Item not found." });
            res.json(items);
        });
};
