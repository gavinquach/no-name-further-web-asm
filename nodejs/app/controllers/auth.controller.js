const config = require("../config/auth.config");
const model = require("../models");
const User = model.user;
const Role = model.role;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// create new User in database (role is user if not specifying role)
exports.signup = async (req, res) => {
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
exports.signupWithRoles = async (req, res) => {
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

exports.login = async (req, res) => {
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
