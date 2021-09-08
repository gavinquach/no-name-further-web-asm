
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const model = {};

model.mongoose = mongoose;

model.user = require("./user.model");
model.notification = require("./notification.model");
model.role = require("./role.model");
model.item = require("./item.model");
model.itemCategory = require("./item.category.model");
model.image = require("./image.model");
model.transaction = require("./transaction.model");
model.tokenSchema = require("./token.model");
model.conversation = require("./conversation.model")
model.message = require("./message.model")

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
    "root"
];

model.ITEMCATEGORIES = [
    "Refrigerated/Processed food",
    "Seafood/Dried fish",
    "Vegetables/Fruits",
    "Instant food",
    "Spices/Condiments",
    "Rice/Nuts",
    "Canned food",
    "Snacks"
];

module.exports = model;