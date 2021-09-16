const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const model = require("../models");
const User = model.user;
const Role = model.role;

verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    try {
        const decoded = jwt.verify(token, config.secret);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).send({ message: "Unauthorized!" });
    }
};

// validate whether the person sending the request is a user
isUser = async (req, res, next) => {
    let user = null;
    try {
        user = await User.findById(req.userId).exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!user) return res.status(404).send({ message: "User not found." });
    next();
};

// validate whether the person sending the request is a user
isRegularUser = async (req, res, next) => {
    let user = null;
    try {
        user = await User.findById(req.userId).exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    const role = await Role.findOne({ name: "user" });
    if (!role) return res.status(404).send({ message: "Role not found." });
    if (JSON.stringify(user.roles) != JSON.stringify([role._id])) {
        return res.status(403).send({ message: "Unauthorized." });
    }

    next();
};

// validate whether the person sending the request is an admin with any admin role
isAdmin = async (req, res, next) => {
    let user = null;
    try {
        user = await User.findById(req.userId).populate("roles", "-__v").exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    let isAdmin = false;
    const adminRoles = model.ROLES.filter(role => role != "user");
    for (const role of user.roles) {// check if client is regular user or root
        if (role.name == "user") {
            return res.status(403).send({ message: "Require admin access!" });
        }
        if (adminRoles.includes(role.name)) {
            isAdmin = true;
        } else {
            isAdmin = false;
        }
    }
    if (isAdmin) next();
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

// validate whether the person sending the request has any of the CRUD admin roles
canViewAdmins = async (req, res, next) => {
    let user = null;
    try {
        user = await User.findById(req.userId).populate("roles", "-__v").exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    let roles = [];
    user.roles.map((role => roles.push(role.name)));
    if (!roles.includes("root")
        && !roles.includes("view_admin")
        && !roles.includes("create_admin")
        && !roles.includes("edit_admin")
        && !roles.includes("delete_admin")
    ) {
        return res.status(403).send({
            message: "You don't have the correct admin permission to access this resource!"
        });
    }
    next();
};

// validate whether the person sending the request has any of the CRUD user roles
canViewUsers = async (req, res, next) => {
    let user = null;
    try {
        user = await User.findById(req.userId).populate("roles", "-__v").exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (!user) return res.status(404).send({ message: "User not found." });

    let roles = [];
    user.roles.map((role => roles.push(role.name)));
    if (!roles.includes("root")
        && !roles.includes("view_user")
        && !roles.includes("create_user")
        && !roles.includes("edit_user")
        && !roles.includes("delete_user")
    ) {
        return res.status(403).send({
            message: "You don't have the correct admin permission to access this resource!"
        });
    }
    next();
};

// deny root account (account made on server init)
isNotRoot = async (req, res, next) => {
    let user = null;
    try {
        user = await User.findOne({
            _id: req.userId,
            username: "root"
        }).exec();
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (user) {
        return res.status(403).send({ message: "Unauthorized." });
    }

    next();
};

const authJwt = {
    verifyToken,
    isUser,
    isAdmin,
    isValidAdmin,
    canViewAdmins,
    canViewUsers,
    isNotRoot
};
module.exports = authJwt;