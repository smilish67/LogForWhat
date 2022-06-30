"use strict";
//모듈
const express = require("express");
const bodyParser = require("body-parser");
const home = require("./src/routes");
const app = express();
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');


app.set("views", "./src/views");
app.set("view engine", "ejs");

app.use(express.static(`${__dirname}/src/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressSession({
    secret: 'LogForWhat',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge : 1000*60*60*3,
    },
}));
app.use("/", home);

module.exports = app;

