const model = require("../models");
const Item = model.item;
const User = model.user;
const Role = model.role;
const Transaction = model.transaction;

const bcrypt = require("bcryptjs");

const img = require("../config/img.config");
const fs = require("fs");

// create new User in database (role is user if not specifying role)
exports.signup = async (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        password: bcrypt.hashSync(req.body.password),
    });

    let role = await Role.findOne({ name: "user" })
    user.roles = [role._id];

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(201).send({ message: "Registered successfully!" });
};

// create new User in database with roles
exports.createUserWithRoles = async (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        password: bcrypt.hashSync(req.body.password),
        roles: req.body.roles
    });

    // check if the data sent has roles
    if (req.body.roles.length > 0) {
        let roles = [];
        try {
            roles = await Role.find({
                name: { $in: req.body.roles }
            });
        } catch (err) {
            return res.status(500).send(err);
        }

        user.roles = roles.map(role => role._id);
    }
    // no roles, return message with 400 Bad Request error
    else {
        return res.status(400).send({ message: "Please add at least 1 role!" });
    }

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(201).send({ message: "Admin created successfully!" });
};

exports.viewAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate("roles", "-__v")
            .populate("items", "-__v")
            .populate("cart", "-__v")
            .exec();

        if (!users) return res.status(404).send({ message: "Users not found." });
        res.json(users);
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.viewAdmins = async (req, res) => {
    let users = [];
    try {
        users = await User.find()
            .populate("roles", "-__v")
            .populate("items", "-__v")
            .populate("cart", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!users) return res.status(404).send({ message: "Users not found." });

    const adminList = [];
    for (const user of users) {
        for (const role of user.roles) {
            if (role.name !== "user") {
                adminList.push(user);
                break;
            }
        }
    }

    res.json(adminList);
};

exports.viewUsers = async (req, res) => {
    let users = [];
    try {
        users = await User.find()
            .populate("roles", "-__v")
            .populate("items", "-__v")
            .populate("cart", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!users) return res.status(404).send({ message: "Users not found." });

    const userList = [];
    for (const user of users) {
        for (const role of user.roles) {
            if (role.name === "user") {
                userList.push(user);
                break;
            }
        }
    }

    res.json(userList);
};

exports.viewOneUser = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.params.id })
            .populate("roles", "-__v")
            .populate("items", "-__v")
            .populate("cart", "-__v")
            .exec();

        if (!user) return res.status(404).send({ message: "User not found." });
        res.json(user);
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.deleteUser = async (req, res) => {
    let user = null;
    try {
        user = await User.findByIdAndRemove(req.params.id).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    // cancel all user transactions
    let transactions = [];
    try {
        transactions = await Transaction.find({
            user_seller: req.params.id,
            status: "Pending"
        }).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!transactions) return res.status(401).send({ message: "Transactions not found." });

    // set status of all transactions of item to cancelled
    transactions.map(async transaction => {
        try {
            transaction.status = "Cancelled";
            transaction.save();
        } catch (err) {
            return res.status(500).send(err);
        }
    });

    // remove item images
    user.items.map(async itemid => {
        let item = null;
        try {
            item = await Item.findById(itemid)
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
            Image.deleteOne({ _id: img.id });
        });
    });

    try {
        await Item.deleteMany({
            seller: req.params.id
        }).exec();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(200).send("User removed successfully!");
};

exports.editUser = async (req, res) => {
    let user = null;
    try {
        user = await User.findById({ _id: req.params.id });
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send("User not found.");

    let roles = [];
    user.roles.map(role => roles.push(role.name));

    // allow root to edit username only
    if (roles.includes("root")) {
        user.username = req.body.username;
    }
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.location = req.body.location;
    if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password);
    }

    // validate roles
    if (req.body.roles) {
        // check if the data sent has roles
        if (req.body.roles.length > 0) {
            let roles = [];
            try {
                roles = await Role.find({
                    name: { $in: req.body.roles }
                });
            } catch (err) {
                return res.status(500).send(err);
            }

            // assign roles to user
            user.roles = roles.map(role => role._id);
        }
        // no roles, return message with 400 Bad Request error
        else {
            return res.status(400).send({ message: "Please add at least 1 role!" });
        }
    }

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "User updated succesfully!" });
};

exports.editInfo = async (req, res) => {
    let user = null;
    try {
        user = await User.findById({ _id: req.params.id });
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send("User not found.");

    user.username = req.body.username;
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.location = req.body.location;

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Updated succesfully!" });
};

exports.editPassword = async (req, res) => {
    let user = null;
    try {
        user = await User.findById({ _id: req.params.id });
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send("User not found.");

    // compare password with password in database using bcrypt
    let isValidOldPassword = bcrypt.compareSync(
        req.body.oldpassword,
        user.password
    );

    if (!isValidOldPassword) {
        return res.status(400).send({
            message: "Old password is incorrect!"
        });
    }

    if (!req.body.newpassword) {
        return res.status(400).send({
            message: "New password required!"
        });
    }

    // compare password with password in database using bcrypt
    let isSamePassword = bcrypt.compareSync(
        req.body.newpassword,
        user.password
    );

    if (isSamePassword) {
        return res.status(400).send({
            message: "New password is the same as old password!"
        });
    }

    user.password = bcrypt.hashSync(req.body.newpassword);
    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Password updated succesfully!" });
};

exports.getUserItems = async (req, res) => {
    let items = [];
    try {
        items = await Item.find({
            seller: req.params.id
        })
            .populate("type", "-__v")
            .populate("forItemType", "-__v")
            .populate("images", "-__v")
            .populate("seller", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.json(items);
};

exports.getUserCart = async (req, res) => {
    let user = null;
    try {
        user = await User.findById(req.body.userid).exec();
    } catch (err) {
        return res.status(500).send(err);
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
            return res.status(500).send(err);
        }
    }

    res.json(items);
};

exports.addItemToCart = async (req, res) => {
    try {
        // check if item is in user transactions
        const transaction = await Transaction.findOne({
            user_buyer: req.body.userid,
            item: req.body.itemid,
            status: "Pending"
        });
        if (transaction) return res.status(400).send({ message: "Item already in transactions!" });
    } catch (err) {
        return res.status(500).send(err);
    }

    let user = null;

    // find user in database to see if it exists
    try {
        user = await User.findById(req.body.userid);
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    // find item in database to see if it exists
    Item.findById(req.body.itemid)
        .exec((err, item) => {
            if (err) return res.status(500).send(err);
            if (!item) return res.status(404).send({ message: "Item not found." });
        });

    if (user.cart.includes(req.body.itemid)) {
        return res.status(400).send({ message: "Item already in cart!" });
    }

    user.cart.push(req.body.itemid);
    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(201).send({ message: "Added item to cart successfully!" });
}

exports.deleteItemFromCart = async (req, res) => {
    let user = null;
    try {
        user = await User.findById(req.params.id).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    // if item is found in cart, remove it
    const itemIndexInCart = user.cart.indexOf(req.body.itemid);
    if (itemIndexInCart > -1) user.cart.splice(itemIndexInCart, 1);

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Item removed from cart successfully!" });
};
