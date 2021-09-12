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
    authJwt.isUser
], controller.createTrade);

// cancel transaction
router.patch("/cancel/trade", [
    authJwt.verifyToken,
    authJwt.isUser
], controller.cancelTrade);

// get transactions
router.get("/trades", [
    authJwt.verifyToken,
    authJwt.isAdmin
], controller.getAllTrades);

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

module.exports = router;