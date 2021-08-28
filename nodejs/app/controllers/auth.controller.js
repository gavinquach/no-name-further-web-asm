const config = require("../config/auth.config");
const model = require("../models");
const User = model.user;
const Role = model.role;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    // find username of the request in database, if it exists
    let user = null;
    try {
        user = await User.findOne({
            username: req.body.username
        })
            .populate("roles", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (!user) return res.status(404).send({ message: "User not found." });

    // compare password with password in database using bcrypt
    const isPasswordValid = bcrypt.compareSync(
        req.body.password,
        user.password
    );

    if (!isPasswordValid) {
        return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
        });
    }

    // generate a token using jsonwebtoken
    const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
    });

    const userRoles = [];
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
};
