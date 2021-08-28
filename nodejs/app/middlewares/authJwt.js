const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const model = require("../models");
const User = model.user;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};

// validate whether the person sending the request is admin
isValidAdmin = (requiredRole) => {
    return validateAdmin = async (req, res, next) => {
        let user = null;
        try {
            user = await User.findById(req.userId).populate("roles", "-__v").exec();
        } catch (err) {
            return res.status(500).send({ message: err });
        }
        if (!user) return res.status(404).send({ message: "User not found." });
    
        let isRoot = false;
        const adminRoles = model.ROLES.filter(role => role != "user");
        for (const role of user.roles) {
            // check if client is regular user or root
            if (role.name == "user") {
                return res.status(403).send({ message: "Require admin access!" });
            } else if (role.name == "root") {
                isRoot = true;
            }
            // check whether the client roles are valid
            if (!adminRoles.includes(role.name)) {
                return res.status(403).send({ message: "Invalid admin role!" });
            }
        }

        const userRoles = [];
        user.roles.map(role => {
            userRoles.push(role.name);
        });

        // client has admin role but doesn't have the correct role
        if (!isRoot && !userRoles.includes(requiredRole)) {
            return res.status(403).send({
                message: "You don't have the correct admin permission to access this resource!"
            });
        }

        next();
    };
}

const authJwt = {
    verifyToken,
    isValidAdmin
};
module.exports = authJwt;