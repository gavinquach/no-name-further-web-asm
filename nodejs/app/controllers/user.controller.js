const model = require("../models");
const Item = model.item;
const User = model.user;
const Role = model.role;
const Transaction = model.transaction;

const bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};

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
exports.createUserWithRoles = (req, res) => {
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

exports.viewUsers = async (req, res) => {
    User.find()
        .populate("roles", "-__v")
        .populate("items", "-__v")
        .populate("cart", "-__v")
        .exec((err, users) => {
            if (err) return res.status(500).send({ message: err });
            if (!users) return res.status(404).send({ message: "User not found." });
            res.json(users);
        });
};

exports.viewOneUser = async (req, res) => {
    User.findById({
        _id: req.params.id
    })
        .populate("roles", "-__v")
        .populate("items", "-__v")
        .populate("cart", "-__v")
        .exec((err, user) => {
            if (err) return res.status(500).send({ message: err });
            if (!user) return res.status(404).send({ message: "User not found." });
            res.json(user);
        });
};

exports.deleteUser = async (req, res) => {
    User.findByIdAndRemove({ _id: req.params.id }, function (err, user) {
        if (err) return res.status(500).send({ message: err });
        if (!user) return res.status(404).send({ message: "User not found." });
        res.json('User successfully removed');
    });
};

exports.editUser = async (req, res) => {
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

exports.editPassword = async (req, res) => {
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

exports.getUserItems = async (req, res) => {
    Item.find({
        seller: req.params.id
    })
        .populate("type", "-__v")
        .populate("forItemType", "-__v")
        .populate("images", "-__v")
        .populate("seller", "-__v")
        .exec((err, items) => {
            if (err) return res.status(500).send({ message: err });
            res.json(items);
        });
};

exports.getUserCart = async (req, res) => {
    let user = null;
    try {
        user = await User.findById(req.body.userid).exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    const items = [];
    for (const itemid of user.cart) {
        try {
            const item = await Item.findById(itemid)
                .populate("type", "-__v")
                .populate("forItemType", "-__v")
                .populate("images", "-__v")
                .populate("seller", "-__v")
                .exec();

            // add item to items array
            item !== null && items.push(item);
        } catch (err) {
            return res.status(500).send({ message: err });
        }
    }

    res.json(items);
};

exports.addItemToCart = async (req, res) => {
    // check if item is in user transactions
    Transaction.findOne({
        user_buyer: req.body.userid,
        item: req.body.itemid,
        status: "Pending"
    }, (err, transaction) => {
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

exports.deleteItemFromCart = async (req, res) => {
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
