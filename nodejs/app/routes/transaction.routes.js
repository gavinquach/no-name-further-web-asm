const controller = require("../controllers/transaction.controller");
const router = require("../routes");

// get, edit, and delete transaction
router
    .route("/transaction/:id")
    .get(controller.getTransaction)
    // .put(controller.editTransaction)
    .delete(controller.deleteTransaction)

// add transaction
router.post("/transaction", controller.createTransaction);

// get transactions
router.get("/transactions", controller.viewAllTransactions);
router.get("/transactions/buyer/:id", controller.getBuyerTransactions);
router.get("/transactions/seller/:id", controller.getSellerTransactions);
router.get("/transactions/item/:id", controller.getItemTransactions);

// cancel transaction
router.patch("/cancel/transaction", controller.cancelTransaction);

module.exports = router;