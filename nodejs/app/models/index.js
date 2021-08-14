
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.item = require("./item.model");
db.itemCategory = require("./item.category.model");
db.image = require("./image.model");
db.transaction = require("./transaction.model")

db.ROLES = [
    "user",
    "view_user",
    "create_user",
    "edit_user",
    "delete_user",
    "view_admin",
    "create_admin",
    "edit_admin",
    "delete_admin",
    "root",
    "promote_user",
    "demote_admin"
];

module.exports = db;