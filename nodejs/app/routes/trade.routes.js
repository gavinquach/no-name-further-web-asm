const controller = require("../controllers/trade.controller");
const { authJwt } = require("../middlewares");
const router = require(".");

// get, edit, and delete transaction
router
    .route("/trade/:id")
    .get(controller.getTrade)
    .delete([
        authJwt.verifyToken,
        authJwt.isAdmin
    ], controller.deleteTrade);

// add transaction
router.post("/trade", [
    authJwt.verifyToken,
    authJwt.isUser,
    authJwt.isNotRoot,
], controller.createTrade);

// get all transactions
router.get("/trades", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.getAllTrades);

// get all transactions, sorted by field
router.get("/trades-sorted-by-field", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.getAllTradesSortedByField);

router.get("/trades/buyer/:id", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getBuyerTrades);

router.get("/trades/seller/:id", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.getSellerTrades);

router.get("/trades/item/:id", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.getItemTrades);

router.get("/trades/user/:id", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.getUserTrades);

router.patch("/trade/approve/:id", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.approveTrade);

router.patch("/trade/deny/:id", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.denyTrade);

// cancel transaction
router.patch("/cancel/trade", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.cancelTrade);

module.exports = router;