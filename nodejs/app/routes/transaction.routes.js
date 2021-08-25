const controller = require("../controllers/transaction.controller");
const router = require("../routes");

router.get("/view/transaction", controller.viewAllTransactions);
router.get("/view/transaction/:id", controller.getTransaction);
router.get("/view/transactions/buyer/:id", controller.getBuyerTransactions);
router.get("/view/transactions/seller/:id", controller.getSellerTransactions);
router.get("/view/transactions/item/:id", controller.getItemTransactions);
// router.post("edit/transaction/:id", controller.editTransaction);
router.post("/add/transaction", controller.createTransaction);
router.get("/delete/transaction/:id", controller.deleteTransaction);
router.post("/cancel/transaction", controller.cancelTransaction);

module.exports = router;