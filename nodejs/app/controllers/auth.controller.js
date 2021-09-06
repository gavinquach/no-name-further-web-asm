const config = require("../config/auth.config");
const model = require("../models");
const User = model.user;
const Token = model.tokenSchema;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// define nodemailer, nodemailerSendgrid and transport
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');

require('dotenv').config();

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
        return res.status(500).send(err);
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

    if (!user.verified) {
        return res.status(401).send({
            message: "Please verify your email!",
            verified: false
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

exports.confirmEmail = async (req, res) => {
    let token = null;
    try {
        token = await Token.findOne({ token: req.params.token });
    } catch (err) {
        return res.status(500).send(err);
    }

    // token is not found in database i.e. token may have expired 
    if (!token) {
        return res.status(400).send({
            message: "Your verification link may have expired. Please click on resend to resend verification email."
        });
    }

    // token is found, check for user
    let user = null;
    try {
        user = await User.findOne({
            _id: token.user,
            email: req.params.email
        });
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    // return error if user is already verified
    if (user.verified) {
        return res.status(400).send("User already verified!");
    }

    // =================== verify user ===================
    // delete token after verifying
    try {
        await token.deleteOne({
            user: user._id
        });
    } catch (err) {
        return res.status(500).send(err);
    }

    // change verified to true
    // and update user in database
    try {
        user.verified = true;
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    res.status(201).send({ message: "Registered successfully!" });
};

exports.resendLink = async (req, res) => {
    // find username of the request in database, if it exists
    let user = null;
    try {
        user = await User.findOne({
            username: req.body.username
        }).exec();
    } catch (err) {
        return res.status(500).send(err);
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

    // return error if user is already verified
    if (user.verified) {
        return res.status(400).send("User already verified!");
    }

    // ========= send verification link =========
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
        resendMessage: "A verification email has been sent to " + user.email + ". It will be expired after 24 hours. Please click on 'Resend email' if you haven't received the email."
    });
};

exports.confirmAndLogin = async (req, res) => {
    let token = null;
    try {
        token = await Token.findOne({ token: req.params.token });
    } catch (err) {
        return res.status(500).send(err);
    }

    // token is not found in database
    if (!token) {
        return res.status(400).send({
            message: "Token not found."
        });
    }

    // token is found, check for user
    let user = null;
    try {
        user = await User.findOne({
            _id: token.user,
            email: req.params.email
        })
            .populate("roles", "-__v")
            .exec();
    } catch (err) {
        return res.status(500).send(err);
    }
    if (!user) {
        return res.status(404).send({ message: "User not found." });
    }

    // return error if user is already verified
    if (user.verified) {
        return res.status(400).send("User already verified!");
    }

    // =================== verify user ===================
    // delete token after verifying
    try {
        await token.deleteOne({
            user: user._id
        });
    } catch (err) {
        return res.status(500).send(err);
    }

    // change verified to true
    // and update user in database
    try {
        user.verified = true;
        await user.save();
    } catch (err) {
        return res.status(500).send(err);
    }

    // generate a token using jsonwebtoken
    const accessToken = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
    });

    const userRoles = [];
    user.roles.map(role => {
        userRoles.push("ROLE_" + role.name.toUpperCase());
    });

    // return user information & access Token
    res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location,
        roles: userRoles,
        accessToken: accessToken
    });
};