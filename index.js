const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const keys = require("./config/keys");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const router = express.Router();
const favicon = require("express-favicon");

require("./models/User");

mongoose.connect(keys.mongoDevelopentURI);

require("./services/passportLocal")(passport);

app.use(favicon(__dirname + "/public/images/favicon.ico"));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: keys.cookieKey,
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 60000 * 60 * 24 }
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require("./routes/authRoutes")(app);

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));

    const path = require("path");
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
