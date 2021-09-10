const model = require("../models");
const ROLES = model.ROLES;
const User = model.user;
const Conversation = model.conversation;
const Message = model.message;

const fs = require('fs');
const img = require("../config/img.config");

const { check, validationResult } = require('express-validator');

checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Username
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        // if it's editing user
        if (req.params.id) {
            // check if id is the same as the one currently editing
            if (user && user._id != req.params.id) {
                res.status(400).send({ message: "Failed! Username is already in use!" });
                return;
            }
        }
        // if it's registering or creating new user
        else {
            if (user) {
                res.status(400).send({ message: "Failed! Username is already in use!" });
                return;
            }
        }

        // Email
        User.findOne({
            email: req.body.email
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            // if it's editing user
            if (req.params.id) {
                // check if id is the same as the one currently editing
                if (user && user._id != req.params.id) {
                    res.status(400).send({ message: "Failed! Email is already in use!" });
                    return;
                }
            }
            // if it's registering or creating new user
            else {
                if (user) {
                    res.status(400).send({ message: "Failed! Email is already in use!" });
                    return;
                }
            }

            next();
        });
    });
};

checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        for (let i = 0; i < req.body.roles.length; i++) {
            if (!ROLES.includes(req.body.roles[i])) {
                res.status(400).send({
                    message: `Failed! Role ${req.body.roles[i]} does not exist!`
                });
                return;
            }
        }
    }

    next();
};

checkUploadPath = (req, res, next) => {
    if (fs.existsSync(img.path)) {
        next();
    }
    else {
        fs.mkdir(img.path, (err) => {
            if (err) {
                console.log('Error in folder creation');
                next();
            }
            next();
        })
    }
};

// function from express-validator -- Duong edit
// Register check if email and password meet requirements
userValidationRules = (req, res, next) => {
    // // username must be an email
    check('email').isEmail().withMessage('Email must be a valid email!');
    // // password must be at least 6 chars long
    check('password').isLength({ min: 6 }).withMessage('Password must be 6 characters long!');
    try {
        validationResult(req).throw();
        next();
    } catch (err) {
        res.status(422).json({ errors: err.mapped() });
    }
}

// Check errors
validateError = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

    return res.status(422).json({
        errors: extractedErrors,
    })
}

// Remove empty conversations with no messages
checkEmptyConversations = async (req, res, next) => {
    // check if user is available in database
    let user = null;
    try {
        user = await User.findById({ _id: req.params.id }).exec();
        if (!user) return res.status(404).send({ message: "User not found." });
    } catch (err) {
        return res.status(500).send(err);
    }

    // find list of conversations in database to see if any conversation exists
    try {
        conversations = await Conversation.find({
            members: { $in: [user._id] },
        }).exec();

        for (const conversation of conversations) {
            const messages = await Message.find({
                conversationId: conversation._id
            }).exec();
            if (!messages || messages.length < 1) {
                try {
                    await Conversation.findByIdAndRemove(
                        conversation._id
                    ).exec();
                } catch (err) {
                    return res.status(500).json(err);
                }
            }
        }

        next();
    } catch (err) {
        return res.status(500).json(err);
    }
}

const validate = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
    checkUploadPath,
    userValidationRules,
    validateError,
    checkEmptyConversations
};

module.exports = validate;