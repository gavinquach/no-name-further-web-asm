const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Image = db.image;
const Item = db.item;
const Transc = db.transaction;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
                accessToken: null,
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
                accessToken: null,
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
    });
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


// Transactions

// Get order by Id
exports.getTransc = (req, res) => {
    Transc.findById({ _id: req.params.id }, function (err, order) {
        if (err) return res.status(500).send({ message: err });
        if (!order) return res.status(404).send({ message: "Transaction not found." });
        res.json(order);
    });
}

// Get order by user

exports.getUserTransc = (req, res) => {
    Transc.find(function (err, orders) {
        if (err) return res.status(500).send({ message: err });
        if (!orders) return res.status(404).send({ message: "Transaction not found." });
        const userOrders = [];
        orders.map(order => {
            if (order.users == req.params.id) {
                userOrders.push(order);
            }
        });
        res.json(userOrders);
    })
};

// Get order by item

exports.getItemTransc = (req, res) => {
    Transc.find(function (err, orders) {
        if (err) return res.status(500).send({ message: err });
        if (!orders) return res.status(404).send({ message: "Transaction not found." });
        const itemOrders = [];
        orders.map(order => {
            if (order.items == req.params.id) {
                itemOrders.push(order);
            }
        });
        res.json(itemOrders);
    })
};

// Post a new order

exports.createTransc = (req, res) => {

    // find user and item in database to see if it exists
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) return res.status(500).send({ message: err });
        if (!user) return res.status(404).send({ message: "Transaction not found." });
    
    Item.findOne({
        itemname: req.body.name
    }).exec((err, item) => {
        if (err) return res.status(500).send({ message: err });
        if (!item) return res.status(404).send({ message: "Transaction not found." });
    })

        const date = new Date();
        // create order object 
        const order = new Order({
            user: user._id,
            item: item._id,
            created_date: date,
            finalization_date: order.finlization_date
        });
    
        // add order to database
        order.save(err => {
            if (err) return res.status(500).send({ message: err });

            user.order.push(order._id);
            user.save(err => {
                if (err) return res.status(500).send({ message: err });
            });

            res.send({ message: "Transaction created successfully!" });
        });
    });
}

// Delete order
exports.deleteTransc = (req, res) => {
    const orderId = req.params.id;
    Transc.findById(orderId, function (err, order) {
        if (err) return res.status(500).send({ message: err });
        if (!order) return res.status(404).send({ message: "Transaction not found." });

                
        Transc.findByIdAndRemove({
                    _id: orderId
                }, function (err, order) {
                    if (err) return res.status(500).send({ message: err });
                    res.json('Transaction successfully removed');
                });
            });
        }
