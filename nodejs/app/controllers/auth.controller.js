const config = require("../config/auth.config");
const model = require("../models");
const User = model.user;
const Token = model.tokenSchema;

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

    if (!user.isVerified) {
        return res.status(401).send({ msg: 'Your Email has not been verified. Please click on resend' });
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

    try {

        const token = await Token.findOne({ token: req.params.token });

        // token is not found into database i.e. token may have expired 
        if (!token) {
            return res.status(400).send({ msg: 'Your verification link may have expired. Please click on resend for verify your Email.' });
        }
        // if token is found then check valid user 
        else {
            const user = await User.findOne({ _id: token._userId, email: req.body.email });

            // Not valid user
            if (!user) {
                return res.status(401).send({ msg: 'We were unable to find a user for this verification. Please SignUp!' });
            }
            // user is already verified
            else if (await user.isVerified) {
                return res.status(200).send('User has been already verified. Please Login');
            }
            // verify user
            else {
                // change isVerified to true
                user.isVerified = true;
                // delete token after verifying 
                await token.deleteOne();
                // saving user
                await user.save();
            }
        }

    } catch (err) {
        return res.status(500).send(err);
    }
    res.status(201).send({ message: "Registered successfully!" });
};




exports.resendLink = async (req, res) => {

    try {

        const user = await User.findOne({ email: req.params.email });

        // user is not found into database
        if (!user) {
            return res.status(400).send({ msg: 'We were unable to find a user with that email. Make sure your Email is correct!' });
        }
        // user has been already verified
        else if (user.isVerified) {
            return res.status(200).send('This account has been already verified. Please log in.');
        }
        // send verification link
        else {
            // generate token and save
            var token = await new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            await token.save();

            // Send email (use verified sender's email address & generated API_KEY on SendGrid)
            const transporter = nodemailer.createTransport(
                sendgridTransport({
                    auth: {
                        api_key: config.sendgrid_api_key
                    }
                })
            )

            var mailOptions = { from: '0nametrading@gmail.com', to: user.email, subject: 'Account Verification Link', text: 'Hello ' + req.body.name + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api/auth' + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' };
            await transporter.sendMail(mailOptions, function (err) {
                if (err) {
                    return res.status(500).send({ msg: 'Technical Issue!, Please click on resend for verify your Email.' });
                }
                return res.status(200).send('A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.');
            });
        }

    } catch (err) {
        return res.status(500).send(err);
    }
};