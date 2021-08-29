const controller = require("../controllers/transaction.controller");
const { authJwt } = require("../middlewares");
const router = require("../routes");

// get, edit, and delete transaction
router
    .route("/transaction/:id")
    .get(controller.getTransaction)
    // .put(controller.editTransaction)
    .delete([
        authJwt.verifyToken,
        authJwt.isAdmin
    ], controller.deleteTransaction)

// add transaction
router.post("/transaction", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.createTransaction);

// cancel transaction
router.patch("/cancel/transaction", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.cancelTransaction);

// get transactions
router.get("/transactions", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.viewAllTransactions);

router.get("/transactions/buyer/:id", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getBuyerTransactions);

router.get("/transactions/seller/:id", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.getSellerTransactions);

router.get("/transactions/item/:id", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.getItemTransactions);

module.exports = router;