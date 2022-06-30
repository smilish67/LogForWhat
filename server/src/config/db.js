"use strict"

const mysql = require("mysql");
const db_secret = require("./db_secret.json");

const db = mysql.createPool({
    host: db_secret.host,
    user: db_secret.user,
    password: db_secret.password,
    database: db_secret.database,
    port: db_secret.port,
    dateStrings : 'date',
    multipleStatements: true,
});


module.exports = db;