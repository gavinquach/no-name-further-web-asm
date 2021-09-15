const model = require("../models");
const config = require("../config/auth.config");
require('dotenv').config();

const Item = model.item;
const User = model.user;
const Role = model.role;
const Token = model.tokenSchema;
const Trade = model.trade;
const Notification = model.notification;
const APIFeatures = require("./apiFeature");

const bcrypt = require("bcryptjs");

const img = require("../config/img.config");
const fs = require("fs");

// define nodemailer, nodemailerSendgrid and transport
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

// create new user
exports.signup = async (req, res) => {
    const user = new User({
        username: req.body.username.toLowerCase(),
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        password: bcrypt.hashSync(req.body.password),
        verified: req.body.verified ? true : false
    });

    let role = await Role.findOne({ name: "user" })
    user.roles = [role._id];

    try {
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    if (req.body.verified) {
        res.status(200).send({
            message: "User created successfully."
        });
    } else {
        // generate token and save
        const token = await new Token({
            user: user._id,
            token: crypto.randomBytes(16).toString('hex')
        });

        try {
            await token.save();
        } catch (err) {
            return res.status(500).send(err);
        }

        // Send email (use verified sender's email address & the generated API_KEY on SendGrid)
        const transporter = nodemailer.createTransport(
            sendgridTransport({
                auth: {
                    api_key: config.sendgrid_api_key
                }
            })
        );

        try {
            await transporter.sendMail({
                from: '0nametrading@gmail.com',
                to: user.email,
                subject: 'n0name Account Verification',
                text: `Hello ${user.username},\n\n` +
                    `Please verify your account by clicking on this link: \n` +
                    // `http://${req.headers.host}/confirmation/${user.email}/${token.token}` +
                    `${process.env.FRONTEND_URL}/login/${user.email}/${token.token}` +
                    `\n\nThank You!`
            });
        } catch (err) {
            return res.status(500).send({ message: "Error encountered! Please click on 'Resend email' to send the email again." });
        }

        res.status(200).send({
            message: "A verification email has been sent to " + user.email + ". It will be expired after 24 hours. Please click on 'Resend email' if you haven't received the email."
        });
    }
};

// create new User in database with roles
exports.createUserWithRoles = async (req, res) => {
    const user = new User({
        username: req.body.username.toLowerCase(),
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        password: bcrypt.hashSync(req.body.password),
        roles: req.body.roles,
        verified: true
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
    // intialize
    let total = 0;
    let users = [];

    try {
        const features = new APIFeatures(
            User.find()
                .populate("roles", "-__v")
                .populate("items", "-__v")
                .populate("cart", "-__v")
            , req.query);

        //count retrieved total data before pagination
        total = await User.countDocuments(features.query);

        // paginating data
        users = await features.paginate().query;

        if (!users || users.length < 1) return res.status(404).send({ message: "Users not found in this page." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        await res.status(200).json({
            totalResults: total,
            result: users.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            users: users
        });

    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.viewAdmins = async (req, res) => {
    // intialize 
    let total = 0;
    let adminRoles = [];
    let admins = [];

    // find all admin roles 
    try {
        adminRoles = await Role.find({ name: { $ne: "user" } })
    } catch (err) {
        return res.status(500).send(err);
    }

    try {
        const features = new APIFeatures(
            User.find({ roles: { $in: adminRoles } })
                .populate("roles", "-__v")
                .populate("items", "-__v")
                .populate("cart", "-__v")
            , req.query);

        //count retrieved total data before pagination
        total = await User.countDocuments(features.query);

        // paginating data
        admins = await features.paginate().query;

        if (!admins || admins.length < 1) return res.status(404).send({ message: "Admins not found." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        res.status(200).json({
            totalResults: total,
            result: admins.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            admins: admins
        });

    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.viewUsers = async (req, res) => {
    // intialize
    let total = 0;
    let users = [];
    let userRole = null;

    // find all admin roles 
    try {
        userRole = await Role.find({ name: "user" });
        if (!userRole) return res.status(404).send({ message: "User Role not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    try {
        const features = new APIFeatures(
            User.find({ roles: { $in: userRole } })
                .populate("roles", "-__v")
                .populate("items", "-__v")
                .populate("cart", "-__v")
            , req.query);

        //count retrieved total data before pagination
        total = await User.countDocuments(features.query);

        // paginating data
        users = await features.paginate().query;

        if (!users || users.length < 1) return res.status(404).send({ message: "Users not found in this page." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        res.status(200).json({
            totalResults: total,
            result: users.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            users: users
        });

    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.viewAdminsSortedByField = async (req, res) => {
    // intialize 
    let total = 0;
    let adminRoles = [];
    let admins = [];

    // find all admin roles 
    try {
        adminRoles = await Role.find({ name: { $ne: "user" } })
    } catch (err) {
        return res.status(500).send(err);
    }

    let field = req.query.field;
    let sort = req.query.sort;

    try {
        const features = new APIFeatures(
            User.find({ roles: { $in: adminRoles } })
                .sort({
                    [field]: sort
                })
                .populate("roles", "-__v")
                .populate("items", "-__v")
                .populate("cart", "-__v")
            , req.query);

        //count retrieved total data before pagination
        total = await User.countDocuments(features.query);

        // paginating data
        admins = await features.paginate().query;

        if (!admins || admins.length < 1) return res.status(404).send({ message: "Admins not found." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        res.status(200).json({
            totalResults: total,
            result: admins.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            admins: admins
        });

    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.viewUsersSortedByField = async (req, res) => {
    // intialize
    let total = 0;
    let users = [];
    let userRole = null;

    // find all admin roles 
    try {
        userRole = await Role.find({ name: "user" });
        if (!userRole) return res.status(404).send({ message: "User Role not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    let field = req.query.field;
    let sort = req.query.sort;

    try {
        const features = new APIFeatures(
            User.find({ roles: { $in: userRole } })
            .sort({
                [field]: sort
            })
                .populate("roles", "-__v")
                .populate("items", "-__v")
                .populate("cart", "-__v")
            , req.query);

        //count retrieved total data before pagination
        total = await User.countDocuments(features.query);

        // paginating data
        users = await features.paginate().query;

        if (!users || users.length < 1) return res.status(404).send({ message: "Users not found in this page." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        res.status(200).json({
            totalResults: total,
            result: users.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            users: users
        });

    } catch (err) {
        return res.status(500).send(err);
    }
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

exports.publicGetUser = async (req, res) => {
    try {
        const temp = await User.findOne({
            $and: [{
                username: req.params.username.toLowerCase()
            }, {
                username: {
                    $ne: "root"
                }
            }]
        }).exec();

        if (!temp) return res.status(404).send({ message: "User not found." });

        const user = {
            _id: temp._id,
            username: temp.username,
            email: temp.email,
            location: temp.location,
            items: temp.items
        }

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

    // cancel all user trades
    let trades = [];
    try {
        trades = await Trade.find({
            user_seller: req.params.id,
            status: { $in: ["PENDING", "WAITING_APPROVAL"] }
        }).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!trades) return res.status(401).send({ message: "Trades not found." });

    // set status of all trades of item to cancelled
    trades.map(async trade => {
        try {
            trade.status = "CANCELLED";
            trade.save();
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
    // initialize
    let items = [];
    let total = 0;

    try {
        // Execute query from Feature API object
        const features = new APIFeatures(
            Item.find({
                seller: req.params.id
            })
                .populate("type", "-__v")
                .populate("forItemType", "-__v")
                .populate("images", "-__v")
                .populate("seller", "-__v")
            , req.query)
            .sort();

        //count retrieved total data before pagination
        total = await Item.countDocuments(features.query);

        // paginating data
        items = await features.paginate().query;


        if (!items || items.length < 1) return res.status(404).send({ message: "Items not found." });


        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        res.status(200).json({
            totalResults: total,
            result: items.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            items: items
        });

    } catch (err) {
        return res.status(500).send(err);
    }
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
        // check if item is in user trades
        let trade = await Trade.findOne({
            user_buyer: req.body.userid,
            item: req.body.itemid,
            status: { $in: ["PENDING", "WAITING_APPROVAL"] }
        });
        if (trade) return res.status(400).send({ message: "Item already in trades!" });
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }

    let user = null;
    let item = null;
    // check if user and item exist
    try {
        user = await User.findById(req.body.userid);
        item = Item.findById(req.body.itemid).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    // check if item exists
    if (!item) return res.status(404).send({ message: "Item not found." });

    // user is the owner of item
    if (item.seller == user._id) {
        return res.status(403).send({ message: "Can't add your own item to cart!" });
    }

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

exports.getUserNotifications = async (req, res) => {
    // intialize
    let total = 0;
    let notifications = [];
    let receiver = null


    // check if receiver is available in database
    try {
        receiver = await User.findById({ _id: req.params.id }).exec();
        if (!receiver) return res.status(404).send({ message: "Receiver not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    // find list of notifications in database to see if any conversation exists
    try {
        const features = new APIFeatures(
            Notification.find({
                receiver: receiver._id
            })
                .sort("-createdAt")
            , req.query);

        //count retrieved total data before pagination
        total = await Notification.countDocuments(features.query);

        // paginating data
        notifications = await features.paginate().query;

        if (!notifications) return res.status(404).send({ message: "Notifications not found." });



        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        return res.status(200).json({
            result: notifications.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            notifications: notifications
        });
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.getUserUnreadNotifications = async (req, res) => {
    // intialize
    let total = 0;
    let limit = 1
    let notifications = [];

    // validate value
    if (req.query.limit || req.query.limit === 'undefined' || parseInt(req.query.limit) > 0) {
        limit = parseInt(req.query.limit);
    }

    try {
        const features = new APIFeatures(
            Notification.find({
                receiver: req.params.id,
                read: false
            })
            , req.query);

        //count retrieved total data before pagination
        total = await Notification.countDocuments(features.query);

        // paginating data
        notifications = await features.paginate().query;

        if (!notifications) return res.status(404).send({ message: "Notifications not found." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        return res.status(200).json({
            result: notifications.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            notifications: notifications
        });
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.getUserNotificationsByType = async (req, res) => {
    // intialize
    let total = 0;
    let notifications = [];
    let receiver = null

    // check if receiver is available in database
    try {
        receiver = await User.findById({ _id: req.params.userid }).exec();
        if (!receiver) return res.status(404).send({ message: "Receiver not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    // find list of notifications in database to see if any conversation exists
    try {
        const features = new APIFeatures(
            Notification.find({
                receiver: receiver._id,
                type: req.params.type
            })
                .sort("-createdAt")
            , req.query);

        //count retrieved total data before pagination
        total = await Notification.countDocuments(features.query);

        // paginating data
        notifications = await features.paginate().query;

        if (!notifications) return res.status(404).send({ message: "Notifications not found." });

        if (features.queryString.limit == null) {
            features.queryString.limit = 1;
        }

        return res.status(200).json({
            result: notifications.length,
            totalPages: Math.ceil(total / features.queryString.limit),
            notifications: notifications
        });
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.addNotification = async (req, res) => {
    let user = null;
    try {
        user = await User.findById(req.body.data.receiver).exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "Users not found." });

    const notification = new Notification(req.body.data);

    if (user.notifications) {
        user.notifications.push(notification);
    } else {
        user.notifications = [notification];
    }

    try {
        await notification.save();
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Notification added to user successfully." });
};

exports.setReadNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            sender: req.body.sender,
            receiver: req.body.receiver,
            createdAt: req.body.createdAt
        }).exec();

        try {
            notification.read = true;
            await notification.save();
        } catch (err) {
            return res.status(500).send(err);
        }
    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(200).send({ message: "Notification set to read." });
};

exports.setReadNotifications = async (req, res) => {
    let notifications = req.body.notifications;
    for (const obj of notifications) {
        try {
            const notification = await Notification.findOne({
                sender: obj.sender,
                receiver: obj.receiver,
                createdAt: obj.createdAt
            }).exec();

            try {
                notification.read = true;
                await notification.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        } catch (err) {
            return res.status(500).send(err);
        }
    }
    res.status(200).send({ message: "Notifications set to read." });
};

exports.setUnreadNotifications = async (req, res) => {
    let notifications = req.body.notifications;
    for (const obj of notifications) {
        try {
            const notification = await Notification.findOne({
                sender: obj.sender,
                receiver: obj.receiver,
                createdAt: obj.createdAt
            }).exec();

            try {
                notification.read = false;
                await notification.save();
            } catch (err) {
                return res.status(500).send(err);
            }
        } catch (err) {
            return res.status(500).send(err);
        }
    }
    res.status(200).send({ message: "Notifications set to unread." });
};

// search
exports.search = async (req, res) => {
    const keyword = decodeURIComponent(req.params.keyword);

    let items = [];
    let users_full = [];
    try {
        items = await Item.find({
            name: {
                '$regex': keyword, '$options': 'i'
            }
        })
            .populate("type", "-__v")
            .populate("forItemType", "-__v")
            .populate("images", "-__v")
            .populate("seller", "-__v")
            .exec();

        let role = await Role.findOne({ name: "user" });
        users_full = await User.find({
            username: {
                '$regex': keyword, '$options': 'i'
            },
            roles: [role._id]
        }).exec();
    } catch (err) {
        return res.status(500).send(err);
    }

    let users = [];
    users_full.map((user) => {
        users.push({
            _id: user._id,
            username: user.username,
            email: user.email,
            location: user.location
        });
    });

    if (items.length < 1 && users.length < 1) {
        return res.status(404).send({ message: "Can't find from keyword." });
    }
    res.status(200).json({
        items: items,
        users: users
    });
}