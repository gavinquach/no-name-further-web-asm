const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const dbConfig = require("./app/config/db.config");
const cors = require("cors");
var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json({limit: '50mb'}));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// allow images to be displayed
app.use("/images", express.static("images"));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to No Name's JWT auth application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

const db = require("./app/models");
const Role = db.role;
const User = db.user;

// Attempt connection to MongoDB server
db.mongoose
    // connect to cloud db ( )
    .connect(`${dbConfig.CLOUD_DB}`, {
    // .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
        // This following to remove warning: 
        // (node:52380) DeprecationWarning: Mongoose: `findOneAndUpdate()` and 
        // `findOneAndDelete()` without the `useFindAndModify` option set to false 
        // are deprecated. See: https://mongoosejs.com/docs/deprecations.html#findandmodify
        useFindAndModify: false 
    })
    .then(() => {
        console.log("Successfully connected to MongoDB.");
        initialize();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });


let bcrypt = require("bcryptjs");
const root = new Role({ name: "root" });

// init database on successful connection
function initialize() {
    // add all the necessary roles for CRUD
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'user' to roles collection");
            });
            new Role({
                name: "view_user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'view_user' to roles collection");
            });
            new Role({
                name: "create_user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'create_user' to roles collection");
            });
            new Role({
                name: "edit_user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'edit_user' to roles collection");
            });
            new Role({
                name: "delete_user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'delete_user' to roles collection");
            });
            new Role({
                name: "view_admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'view_admin' to roles collection");
            });
            new Role({
                name: "create_admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'create_admin' to roles collection");
            });
            new Role({
                name: "edit_admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'edit_admin' to roles collection");
            });
            new Role({
                name: "delete_admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'delete_admin' to roles collection");
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
                roles: [root]
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("Added 'root' to users collection");
            });
        }
    });
}