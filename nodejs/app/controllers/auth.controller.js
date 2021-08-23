const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Image = db.image;
const Item = db.item;
const Transaction = db.transaction;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const img = require("../config/img.config");
const fs = require("fs");
const uploadFile = require("../middlewares/storeImage");

// create new User in database (role is user if not specifying role)
exports.signup = (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        password: bcrypt.hashSync(req.body.password),
    });

    user.save((err, user) => {
        if (err) return res.status(500).send({ message: err });

        Role.findOne({ name: "user" }, (err, role) => {
            if (err) return res.status(500).send({ message: err });

            user.roles = [role._id];
            user.save(err => {
                if (err) return res.status(500).send({ message: err });
                res.send({ message: "User was registered successfully!" });
            });
        });
    });
};

// create new User in database with roles
exports.signupWithRoles = (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        password: bcrypt.hashSync(req.body.password),
        roles: req.body.roles
    });

    if (req.body.roles) {
        Role.find({
            name: { $in: req.body.roles }
        },
            (err, roles) => {
                if (err) return res.status(500).send({ message: err });

                user.roles = roles.map(role => role._id);
                user.save(err => {
                    if (err) return res.status(500).send({ message: err });
                    res.send({ message: "User was registered with roles successfully!" });
                });
            }
        );
    } else {
        res.status(500).send({ message: "Roles not found" });
        return;
    }
};

exports.login = (req, res) => {
    // find username of the request in database, if it exists
    User.findOne({
        username: req.body.username
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: err });
            if (!user) return res.status(404).send({ message: "User not found." });

            // compare password with password in database using bcrypt
            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            // generate a token using jsonwebtoken
            let token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            let userRoles = [];
            for (let i = 0; i < user.roles.length; i++) {
                userRoles.push("ROLE_" + user.roles[i].name.toUpperCase());
            }

            // return user information & access Token
            res.status(200).send({
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                location: user.location,
                roles: userRoles,
                accessToken: token
            });
        });
};

exports.viewUsers = (req, res) => {
    User.find(function (err, users) {
        if (err) return res.status(500).send({ message: err });
        if (!users) return res.status(404).send({ message: "User not found." });
        res.json(users);
    }).populate("roles", "-__v");   // fix undefined roles
};

exports.viewOneUser = (req, res) => {
    User.findById({ _id: req.params.id }, function (err, user) {
        if (err) return res.status(500).send({ message: err });
        if (!user) return res.status(404).send({ message: "User not found." });
        res.json(user);
    }).populate("roles", "-__v");
};

exports.deleteUser = (req, res) => {
    User.findByIdAndRemove({ _id: req.params.id }, function (err, user) {
        if (err) return res.status(500).send({ message: err });
        if (!user) return res.status(404).send({ message: "User not found." });
        res.json('User successfully removed');
    });
};

exports.editUser = (req, res) => {
    User.findById({ _id: req.params.id }, function (err, user) {
        if (err) return res.status(500).send({ message: err });
        if (!user) return res.status(404).send("User not found");

        user.username = req.body.username;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.location = req.body.location;
        if (req.body.password) user.password = bcrypt.hashSync(req.body.password);

        if (req.body.roles) {
            Role.find({
                name: {
                    $in: req.body.roles
                }
            }, (err, roles) => {
                if (err) return res.status(500).send({ message: err });

                user.roles = roles.map(role => role._id);
                user.save(err => {
                    if (err) return res.status(500).send({ message: err });
                    res.send({ message: "Updated succesfully!" });
                });
            });
        } else {
            user.save(err => {
                if (err) return res.status(500).send({ message: err });
                res.send({ message: "Updated succesfully!" });
            });
        }
    });
};

exports.editPassword = (req, res) => {
    User.findById({ _id: req.params.id }, function (err, user) {
        if (err) return res.status(500).send({ message: err });
        if (!user) return res.status(404).send("User not found");

        // compare password with password in database using bcrypt
        let passwordIsValid = bcrypt.compareSync(
            req.body.oldpassword,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Old password is incorrect!"
            });
        }

        // compare password with password in database using bcrypt
        let isSamePassword = bcrypt.compareSync(
            req.body.newpassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(401).send({
                message: "New password is the same as old password!"
            });
        }

        if (req.body.newpassword) {
            user.password = bcrypt.hashSync(req.body.newpassword);
            user.save(err => {
                if (err) return res.status(500).send({ message: err });
                res.send({ message: "Updated succesfully!" });
            });
        }
    });
};

exports.uploadImage = (req, res) => {
    const img = new Image({
        name: req.body.name,
        size: req.body.size,
        type: req.body.type,
        upload_date: req.body.upload_date,
        data_url: req.body.data_url,
        item: req.body.item
    });

    Item.findById(req.body.id)
        .exec((err, item) => {
            if (err) return res.status(500).send({ message: err });
            if (!item) return res.status(404).send({ message: "Item not found." });

            img.save(err => {
                if (err) return res.status(500).send({ message: err });
                res.send({ message: "Image uploaded successfully!" });
            });
        });
};

exports.deleteImage = (req, res) => {
    Image.findByIdAndRemove({ _id: req.params.id }, function (err, image) {
        if (err) return res.status(500).send({ message: err });
        if (!image) return res.status(404).send({ message: "Image not found." });
        res.json('Image successfully removed');
    });
};

exports.getImage = (req, res) => {
    Image.findById({ _id: req.params.id }, function (err, image) {
        if (err) return res.status(500).send({ message: err });
        if (!image) return res.status(404).send({ message: "Image not found." });
        res.json(image);
    });
};

exports.uploadSingle = async (req, res) => {
    try {
        await uploadFile.single(req, res);

        if (req.file == undefined) {
            return res.status(400).send({ message: "Incorrect file type or file not found" });
        }

        res.status(200).send({
            message: "File uploaded successfully: " + req.file.originalname,
        });
    } catch (err) {
        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: `File size cannot be larger than ${img.maxSize / (1024 * 1024)} MB!`,
            });
        }

        res.status(500).send({
            message: `Error uploading file. ${err}`,
        });
    }
};

exports.getListFiles = (req, res) => {
    const directoryPath = img.path;

    fs.readdir(directoryPath, function (err, files) {
        if (err) return res.status(500).send({ message: "Unable to scan files!", });
        if (!files) return res.status(404).send({ message: "Files not found." });

        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: req.get('host') + "/images/" + file,
            });
        });

        res.status(200).send(fileInfos);
    });
};

exports.createItem = (req, res) => {
    // validate username
    if (!req.body.username) return res.status(500).send({ message: "Invalid user." });

    // find username in database to see if it exists
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) return res.status(500).send({ message: err });
        if (!user) return res.status(404).send({ message: "User not found." });

        const date = new Date();
        // create item object from array passed through
        const item = new Item({
            name: req.body.itemObj.name,
            quantity: req.body.itemObj.quantity,
            type: req.body.itemObj.type,
            images: [],
            forItemName: req.body.itemObj.forItemName,
            forItemQty: req.body.itemObj.forItemQty,
            forItemType: req.body.itemObj.forItemType,
            seller: user._id,
            upload_date: date
        });

        // create list of image objects from the array passed through
        const images = [];
        req.body.imgList.map(image => {
            image.map(img => {
                images.push(new Image({
                    name: img.name,
                    size: img.size,
                    type: img.type,
                    upload_date: date,
                    data_url: Buffer.from(img.data_url),
                    item: item._id,
                    cover: img.cover
                }));
            });
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
};

exports.editItem = (req, res) => {
    Item.findById(req.params.id, function (err, item) {
        // create item object from array passed through
        item.name = req.body.itemObj.name;
        item.quantity = req.body.itemObj.quantity;
        item.type = req.body.itemObj.type;
        item.forItemName = req.body.itemObj.forItemName;
        item.forItemQty = req.body.itemObj.forItemQty;
        item.forItemType = req.body.itemObj.forItemType;

        // create list of image objects from the new image array passed through
        const images = [];
        const date = new Date();
        req.body.newImgList.map(image => {
            images.push(new Image({
                name: image.name,
                size: image.size,
                type: image.type,
                upload_date: date,
                data_url: Buffer.from(image.data_url),
                item: item._id,
                cover: image.cover
            }));
        })

        // remove old images from database from the old image array passed through
        req.body.oldImgList.map(image => {
            Image.findByIdAndRemove(image._id, function (err, image) {
                if (err) return res.status(500).send({ message: err });
                // if (!image) return res.status(404).send({ message: "Image not found." });
            });
        });

        // add new images to database
        images.map(image => {
            image.save(err => {
                if (err) return res.status(500).send({ message: err });
            });
            // add image id to item's list of images
            item.images.push(image._id);
        })

        // update item in database
        item.save(err => {
            if (err) return res.status(500).send({ message: err });
            res.send({ message: "Item updated successfully!" });
        });
    });
};

exports.deleteItem = (req, res) => {
    const itemId = req.params.id;
    Item.findById(itemId, function (err, item) {
        if (err) return res.status(500).send({ message: err });
        if (!item) return res.status(404).send({ message: "Item not found." });

        // remove images related to item
        item.images.map(image => {
            Image.findByIdAndRemove({ _id: image._id }, (err, img) => {
                if (err) return res.status(500).send({ message: err });
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

exports.getItem = (req, res) => {
    Item.findById({ _id: req.params.id }, function (err, item) {
        if (err) return res.status(500).send({ message: err });
        if (!item) return res.status(404).send({ message: "Item not found." });
        res.json(item);
    }).populate("images", "-__v");
};

exports.getUserItems = (req, res) => {
    Item.find(function (err, items) {
        if (err) return res.status(500).send({ message: err });
        if (!items) return res.status(404).send({ message: "Item not found." });
        const userItems = [];
        items.map(item => {
            if (item.seller == req.params.id) {
                userItems.push(item);
            }
        });
        res.json(userItems);
    }).populate("images", "-__v");
};

exports.getAllItems = (req, res) => {
    Item.find(function (err, items) {
        if (err) return res.status(500).send({ message: err });
        if (!items) return res.status(404).send({ message: "Item not found." });
        res.json(items);
    }).populate("images", "-__v");
};

// Get transaction by Id
exports.getTransaction = (req, res) => {
    Transaction.findById({ _id: req.params.id }, function (err, transc) {
        if (err) return res.status(500).send({ message: err });
        if (!transc) return res.status(404).send({ message: "Transaction not found." });
        res.json(transc);
    });
}

// Get all transactions
exports.viewAllTransactions = (req, res) => {
    Transaction.find(function (err, transactions) {
        if (err) return res.status(500).send({ message: err });
        if (!transactions) return res.status(404).send({ message: "Transactions not found." });
        res.json(transactions);
    }).populate("item", "-__v");
};

// Get transactions by buyer id
exports.getBuyerTransactions = (req, res) => {
    Transaction.find({ user_buyer: req.params.id }, function (err, transactions) {
        if (err) return res.status(500).send({ message: err });
        if (!transactions) return res.status(404).send({ message: "Transactions not found." });
        res.json(transactions);
    }).populate("item", "-__v");
};

// Get transactions by seller id
exports.getSellerTransactions = (req, res) => {
    Transaction.find({ user_seller: req.params.id }, function (err, transactions) {
        if (err) return res.status(500).send({ message: err });
        if (!transactions) return res.status(404).send({ message: "Transactions not found." });
        res.json(transactions);
    }).populate("item", "-__v");
};

// Get transactions by item id
exports.getItemTransactions = (req, res) => {
    Transaction.find({ item: req.params.id }, function (err, transactions) {
        if (err) return res.status(500).send({ message: err });
        if (!transactions) return res.status(404).send({ message: "Transactions not found." });
        res.json(transactions);
    }).populate("item", "-__v");
};

// Post a new transaction
exports.createTransaction = (req, res) => {
    // check if user same item in transaction and is ongoing
    Transaction.findOne({
        item: req.body.itemid,
        user_buyer: req.body.userid,
        status: "Pending"
    }).exec((err, transc) => {
        if (err) return res.status(500).send({ message: err });
        if (transc) return res.status(401).send({ message: "Transaction already exists!" });

        // find user and item in database to see if it exists
        User.findById(req.body.userid)
            .exec((err, user) => {
                if (err) return res.status(500).send({ message: err });
                if (!user) return res.status(404).send({ message: "User not found." });

                // if item is found in cart, remove it
                const itemIndexInCart = user.cart.indexOf(req.body.itemid);
                if (itemIndexInCart > -1) user.cart.splice(itemIndexInCart, 1);

                user.save(err => {
                    if (err) return res.status(500).send({ message: err });
                });

                Item.findById(req.body.itemid)
                    .exec((err, item) => {
                        if (err) return res.status(500).send({ message: err });
                        if (!item) return res.status(404).send({ message: "Item not found." });

                        const currentDate = new Date();
                        let datePlus2Weeks = new Date();
                        datePlus2Weeks.setDate(datePlus2Weeks.getDate() + 2 * 7);   // add 2 weeks to date

                        // create transaction object
                        const transc = new Transaction({
                            user_seller: item.seller,
                            user_buyer: user._id,
                            item: item._id,
                            created_date: currentDate,
                            expirational_date: datePlus2Weeks,
                            status: "Pending"
                        });

                        // add transaction to database
                        transc.save(err => {
                            if (err) return res.status(500).send({ message: err });
                            res.send({ message: "Transaction created successfully!" });
                        });
                    });
            });
    });
}

// Delete transaction
exports.deleteTransaction = (req, res) => {
    const transcId = req.params.id;
    Transaction.findById(transcId, function (err, transaction) {
        if (err) return res.status(500).send({ message: err });
        if (!transaction) return res.status(404).send({ message: "Transaction not found." });

        Transaction.findByIdAndRemove({
            _id: transcId
        }, function (err, transaction) {
            if (err) return res.status(500).send({ message: err });
            res.json('Transaction successfully removed');
        });
    });
}

// Cancel transaction, set status to cancelled
exports.cancelTransaction = (req, res) => {
    Transaction.findOne({
        user_buyer: req.body.userid,
        item: req.body.itemid,
        status: "Pending"
    }, function (err, transaction) {
        if (err) return res.status(500).send({ message: err });
        if (!transaction) return res.status(401).send({ message: "Transaction not found." });

        transaction.status = "Cancelled";
        transaction.save(err => {
            if (err) return res.status(500).send({ message: err });
            res.send({ message: "Transaction cancelled successfully!" });
        })
    });
}

// Edit to finalize
exports.editToFinalize = (req, res) => {
    const date = new Date();
    Transaction.findById(req.params.id, function (err, transc) {
        // create finalized transaction object from array passed through
        transc.user_buyer = req.body.transcObj.user_buyer; // Add the buyer to transaction
        transc.finalization_date = date;
        transc.status = "Finalized"

        // update item in database
        item.save(err => {
            if (err) return res.status(500).send({ message: err });
            res.send({ message: "Item updated successfully!" });
        });
    });
};

// Edit to expire


exports.addItemToCart = (req, res) => {
    // check if item is in user transactions
    Transaction.findOne({
        user_buyer: req.body.userid,
        item: req.body.itemid,
        status: "Pending"
    }, function (err, transaction) {
        if (err) return res.status(500).send({ message: err });
        if (transaction) return res.status(401).send({ message: "This item is in transactions!" });

        // find user in database to see if it exists
        User.findById(req.body.userid)
            .exec((err, user) => {
                if (err) return res.status(500).send({ message: err });
                if (!user) return res.status(404).send({ message: "User not found." });

                // find item in database to see if it exists
                Item.findById(req.body.itemid)
                    .exec((err, item) => {
                        if (err) return res.status(500).send({ message: err });
                        if (!item) return res.status(404).send({ message: "Item not found." });
                    });

                itemid = req.body.itemid;

                if (user.cart.includes(itemid)) return res.status(401).send({ message: "Item already in cart!" });

                user.cart.push(itemid);
                user.save(err => {
                    if (err) return res.status(500).send({ message: err });
                    res.send({ message: "Added item to cart successfully!" });
                });
            });
    })
}

exports.deleteItemFromCart = (req, res) => {
    User.findById(req.body.userid)
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: err });
            if (!user) return res.status(404).send({ message: "User not found." });

            // if item is found in cart, remove it
            const itemIndexInCart = user.cart.indexOf(req.params.id);
            if (itemIndexInCart > -1) user.cart.splice(itemIndexInCart, 1);

            user.save(err => {
                if (err) return res.status(500).send({ message: err });
                res.send({ message: "Item removed from cart successfully!" });
            });
        });
};
