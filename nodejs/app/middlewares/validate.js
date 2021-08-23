const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

const fs = require('fs');
const img = require("../config/img.config");

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
        fs.mkdir(img.path, function (err) {
            if (err) {
                console.log('Error in folder creation');
                next();
            }
            next();
        })
    }
};

const validate = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted,
    checkUploadPath
};

module.exports = validate;