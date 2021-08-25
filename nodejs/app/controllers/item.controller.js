const model = require("../models");
const Image = model.image;
const Item = model.item;
const ItemCategory = model.itemCategory;
const User = model.user;

const img = require("../config/img.config");
const fs = require("fs");

exports.createItem = async (req, res) => {
    // validate username
    if (!req.body.userid) return res.status(500).send({ message: "Invalid user." });

    // find username in database to see if it exists
    User.findById(req.body.userid).exec((err, user) => {
        if (err) return res.status(500).send({ message: err });
        if (!user) return res.status(404).send({ message: "User not found." });

        ItemCategory.find().exec((err, categories) => {
            if (err) return res.status(500).send({ message: err });
            if (!categories) return res.status(404).send({ message: "Item categories not found!" });

            let itemType = null;
            let forItemType = null;
            categories.map(category => {
                if (category.name === req.body.type) {
                    itemType = category._id;
                } else if (category.name === req.body.forItemType) {
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

            // validate files
            if (req.files.length <= 0) {
                return res.status(401).send("You must upload at least 1 file.");
            }
            if (req.files == undefined) {
                return res.status(404).send({ message: "Incorrect file type or file not found" });
            }

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
            })

            // add images to database
            images.map(image => {
                image.save(err => {
                    if (err) return res.status(500).send({ message: err });
                });
                // add image id to item's list of images
                item.images.push(image._id);
            })

            // add item to database
            item.save(err => {
                if (err) return res.status(500).send({ message: err });

                user.items.push(item._id);
                user.save(err => {
                    if (err) return res.status(500).send({ message: err });
                });

                res.send({ message: "Item created successfully!" });
            });
        });
    });
};

exports.editItem = async (req, res) => {
    Item.findById(req.params.id)
        .populate("type", "-__v")
        .populate("forItemType", "-__v")
        .exec(function (err, item) {
            if (err) return res.status(500).send({ message: err });
            if (!item) return res.status(404).send({ message: "Item not found!" });

            const itemObj = JSON.parse(req.body.item);

            ItemCategory.find().exec((err, categories) => {
                if (err) return res.status(500).send({ message: err });
                if (!categories) return res.status(404).send({ message: "Item categories not found!" });

                let itemType = null;
                let forItemType = null;
                categories.map(category => {
                    if (category.name === itemObj.type) {
                        itemType = category._id;
                    } else if (category.name === itemObj.forItemType) {
                        forItemType = category._id;
                    }
                });

                if (itemType === null || forItemType === null) {
                    return res.status(404).send({ message: "Invalid item category." });
                }

                const date = new Date();
                // update item data
                item.name = itemObj.name;
                item.quantity = itemObj.quantity;
                item.type = itemType;
                item.forItemName = itemObj.forItemName;
                item.forItemQty = itemObj.forItemQty;
                item.forItemType = forItemType;
                item.last_update = date;

                // validate files
                if (req.files == undefined) {
                    return res.status(404).send({ message: "Incorrect file type or file not found" });
                }


                // create list of image objects
                const images = [];
                req.files.map((image, index) => {
                    images.push(new Image({
                        name: image.filename,
                        size: image.size,
                        type: image.mimetype,
                        item: item._id,
                        cover: JSON.parse(req.body.coverIndexes)[index]
                    }));
                })

                // remove old images from database and files
                if (req.body.oldImages) {
                    if (Array.isArray(req.body.oldImages)) {
                        req.body.oldImages.map(oldImage => {
                            const parsedImage = JSON.parse(oldImage);

                            const path = img.path.concat(parsedImage.name)
                            fs.unlink(path, (err) => {
                                // if (err) return res.status(500).send({ message: err });
                            });

                            // remove images from item database
                            const imageIndex = item.images.indexOf(parsedImage._id);
                            if (imageIndex > -1) {
                                item.images.splice(imageIndex, 1);
                            }

                            Image.deleteOne({ _id: parsedImage._id }, function (err, image) {
                                // if (err) return res.status(500).send({ message: err });
                                // if (!image) return res.status(404).send({ message: "Image not found." });
                            });
                        });
                    } else {
                        const parsedImage = JSON.parse(req.body.oldImages);

                        const path = img.path.concat(parsedImage.name)
                        fs.unlink(path, (err) => {
                            // if (err) return res.status(500).send({ message: err });
                        })

                        // remove images from item database
                        const imageIndex = item.images.indexOf(parsedImage._id);
                        if (imageIndex > -1) {
                            item.images.splice(imageIndex, 1);
                        }

                        Image.deleteOne({ _id: parsedImage._id }, function (err, image) {
                            // if (err) return res.status(500).send({ message: err });
                            // if (!image) return res.status(404).send({ message: "Image not found." });
                        });
                    }
                }

                // add new images to database
                images.map(image => {
                    image.save(err => {
                        if (err) {
                            // return res.status(500).send({ message: err })
                        };
                    });
                    // add image id to item's list of images
                    item.images.push(image._id);
                });

                // update item in database
                item.save(err => {
                    if (err) return res.status(500).send({ message: err });
                    res.send({ message: "Item updated successfully!" });
                });
            });
        });
};

exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;
    Item.findById(itemId, function (err, item) {
        if (err) return res.status(500).send({ message: err });
        if (!item) return res.status(404).send({ message: "Item not found." });

        // remove images related to item
        item.images.map(id => {
            Image.findById(id, function (err, image) {
                // if (err) return res.status(500).send({ message: err });
                // if (!image) return res.status(404).send({ message: "Image not found." });

                if (image) {
                    fs.unlink(img.path.concat(image.name), (err) => {
                        // if (err) return res.status(500).send({ message: err });
                    });
                }
            });

            Image.deleteOne({ _id: id }, (err, deleted) => {
                // if (err) return res.status(500).send({ message: err });
                // if (!deleted) return res.status(404).send({ message: "Image not found." });
            });
        });

        // get user from item seller id
        User.findById(item.seller)
            .exec((err, user) => {
                if (err) return res.status(500).send({ message: err });
                if (!user) return res.status(404).send({ message: "User not found." });

                // remove item from user items array
                user.items.splice(user.items.indexOf(item._id), 1);
                user.save(err => {
                    if (err) return res.status(500).send({ message: err });

                    // finally, remove item from database
                    Item.findByIdAndRemove({
                        _id: itemId
                    }, function (err, item) {
                        if (err) return res.status(500).send({ message: err });
                        res.json('Item successfully removed');
                    });
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
        .exec(function (err, item) {
            if (err) return res.status(500).send({ message: err });
            if (!item) return res.status(404).send({ message: "Item not found." });
            res.json(item);
        });
};

exports.getUserItems = async (req, res) => {
    Item.find()
        .populate("type", "-__v")
        .populate("forItemType", "-__v")
        .populate("images", "-__v")
        .populate("seller", "-__v")
        .exec((err, items) => {
            if (err) return res.status(500).send({ message: err });
            if (!items) return res.status(404).send({ message: "Item not found." });

            const userItems = [];
            items.map(item => {
                if (item.seller._id == req.params.id) {
                    userItems.push(item);
                }
            });
            res.json(userItems);
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
