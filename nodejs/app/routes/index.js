const rateLimit = require("express-rate-limit");
const toobusy = require('toobusy-js');

// initialize express router
const express = require("express");
const router = express.Router();

//set limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // limit each IP this amount of requests per windowMs
});

router.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );

    if (toobusy()) {
        // log if you see necessary
        res.status(503).send("Server too busy.");
    } else {
        next();
    }
}, limiter);

module.exports = router;