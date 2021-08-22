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

    app.post(API_URL + "add/image", storeImage.single('image'), controller.uploadImage);

    app.get(API_URL + "view/img/:id", controller.getImage);

    app.post(API_URL + "add/item", controller.createItem);
    app.get(API_URL + "view/items", controller.getAllItems);
    app.get(API_URL + "view/user/items/:id", controller.getUserItems);
    app.get(API_URL + "view/item/:id", controller.getItem);
    app.post(API_URL + "edit/item/:id", controller.editItem);
    app.get(API_URL + "delete/item/:id", controller.deleteItem);
    
    app.get(API_URL + "view/transaction", controller.viewAllTransactions);
    app.get(API_URL + "view/transaction/:id", controller.getTransaction);
    app.get(API_URL + "view/transactions/buyer/:id", controller.getBuyerTransactions);
    app.get(API_URL + "view/transactions/seller/:id", controller.getSellerTransactions);
    app.get(API_URL + "view/transactions/item/:id", controller.getItemTransactions);
    // app.post(API_URL + "edit/transaction/:id", controller.editTransaction);
    app.post(API_URL + "add/transaction", controller.createTransaction);
    app.get(API_URL + "delete/transaction/:id", controller.deleteTransaction);   

    app.post(API_URL + "addtocart", controller.addItemToCart);
    app.post(API_URL + "deletefromcart/:id", controller.deleteItemFromCart);
};