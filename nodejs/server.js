require('dotenv').config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const dbConfig = require("./app/config/db.config");
const cors = require("cors");
const corsOptions = {
    origin: process.env.FRONTEND_URL
};

app.use(cors(corsOptions));

// protect app from some well-known web vulnerabilities by setting HTTP headers appropriately
const helmet = require('helmet');
app.use(helmet());

// parse requests of content-type - application/json
app.use(express.json({ limit: '50mb' }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// allow images to be displayed
app.use("/images", express.static("images"));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to No Name's JWT auth application." });
});

const rateLimit = require("express-rate-limit");
const toobusy = require('toobusy-js');

//set limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // limit each IP this amount of requests per windowMs
});

app.use((req, res, next) => {
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

const authRoutes = require('./app/routes/auth.routes');
const userRoutes = require('./app/routes/user.routes');
const itemRoutes = require('./app/routes/item.routes');
const imageRoutes = require('./app/routes/image.routes');
const transactionRoutes = require('./app/routes/transaction.routes');

// routes
app.use(authRoutes);
app.use(userRoutes);
app.use(itemRoutes);
app.use(imageRoutes);
app.use(transactionRoutes);

// set port, listen for requests
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

const model = require("./app/models");

// Attempt connection to MongoDB server
model.mongoose
    // connect to cloud database
    .connect(`${dbConfig.CLOUD_DB}`, {
    // .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,

        // This following to remove warning: 
        // (node:52380) DeprecationWarning: Mongoose: `findOneAndUpdate()` and 
        // `findOneAndDelete()` without the `useFindAndModify` option set to false 
        // are deprecated. See: https://mongoosejs.com/docs/deprecations.html#findandmodify
        useFindAndModify: false,

        // Fix following warning:
        // "DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead."
        useCreateIndex: true
    })
    .then(() => {
        console.log("Successfully connected to MongoDB.");
        initialize();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

const Role = model.role;
const User = model.user;
const ItemCategory = model.itemCategory;
const bcrypt = require("bcryptjs");

// init database on successful connection
function initialize() {
    // create root role here to add to roles and also assign to user
    // (do this to have same _id value)
    const root = new Role({ name: "root" });

    // add all the necessary roles to roles collection
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            model.ROLES.forEach(role => {
                if (role.toString() !== "root") {
                    new Role({
                        name: role.toString()
                    }).save(err => {
                        if (err) {
                            console.log("error", err);
                        }
                        console.log(`Added '${role.toString()}' to roles collection`);
                    });
                }
            });
            root.save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'root' to roles collection");
            });
        }
    });

    // add root admin to users collection
    User.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new User({
                username: "root",
                email: "",
                password: bcrypt.hashSync("123456"),
                roles: [root],
                verified: true
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'root' to users collection");
            });
        }
    });


    // add categories to itemcategories collection
    ItemCategory.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            model.ITEMCATEGORIES.forEach(category => {
                if (category.toString() !== "root") {
                    new ItemCategory({
                        name: category.toString()
                    }).save(err => {
                        if (err) {
                            console.log("error", err);
                        }
                        console.log(`Added '${category.toString()}' to itemcategories collection`);
                    });
                }
            });
        }
    });
}