const { validate, storeImage } = require("../middlewares");
const controller = require("../controllers/auth.controller");

const API_URL = "/api/auth/";

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        API_URL + "signup", [
            validate.checkDuplicateUsernameOrEmail,
            validate.checkRolesExisted
        ],
        controller.signup
    );

    app.post(
        API_URL + "signupWithRoles", [
            validate.checkDuplicateUsernameOrEmail,
            validate.checkRolesExisted
        ],
        controller.signupWithRoles
    );

    app.post(API_URL + "login", controller.login);
    
    app.get(API_URL + "view/users", controller.viewUsers);
    app.get(API_URL + "view/user/:id", controller.viewOneUser);
    
    app.post(API_URL + "edit/user/:id", [
            validate.checkDuplicateUsernameOrEmail
        ],
        controller.editUser
    );

    app.get(API_URL + "delete/user/:id", controller.deleteUser);

    app.post(API_URL + "user/edit/password/:id", controller.editPassword);

    app.post(API_URL + "upload/image", storeImage.single('image'), controller.uploadImage);

    app.get(API_URL + "view/img/:id", controller.getImage);

    app.post(API_URL + "additem", controller.createItem);
    app.get(API_URL + "view/items/user/:id", controller.getUserItems);
    app.get(API_URL + "view/item/:id", controller.getItem);
    app.post(API_URL + "edit/item/:id", controller.editItem);
    app.get(API_URL + "delete/item/:id", controller.deleteItem);
};