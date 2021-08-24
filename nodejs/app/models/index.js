
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const model = {};

model.mongoose = mongoose;

model.user = require("./user.model");
model.role = require("./role.model");
model.item = require("./item.model");
model.itemCategory = require("./item.category.model");
model.image = require("./image.model");
model.transaction = require("./transaction.model")

model.ROLES = [
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


module.exports = model;