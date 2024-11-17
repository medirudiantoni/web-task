const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const port = 4000;
// const config = require("./config/config");
// const { Sequelize, QueryTypes } = require("sequelize");
const helper = require("./src/libs/helper");
// const upload = require("./src/middlewares/multer");
// const bcrypt = require("bcrypt");
// const session = require("express-session");
// const flash = require("express-flash");

require("dotenv").config();

const environment = process.env.NODE_ENV;

// const sequelize = new Sequelize(config.development);
const sequelize = new Sequelize(config[environment]);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src", "views"));
hbs.registerHelper("excerpt", helper.excerpt);
hbs.registerHelper("timeAgo", helper.timeAgo);
hbs.registerHelper("formatDate", helper.formatDate);
hbs.registerHelper("calculateDuration", helper.calculateDuration);
hbs.registerHelper("eq", helper.eq);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src", "assets")));
app.use(
  session({
    name: "my-session",
    secret: "korewakaizokuogininaruatokoda",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.session = {
    user: req.session.user,
  };
  next();
});

hbs.registerPartials(path.join(__dirname, "src", "views", "partials"));


app.listen(port, () => console.log(`Running on port: ${port}`));