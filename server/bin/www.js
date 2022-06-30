"use strict"

const app = require("../app");
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, err => {
    if(err) throw err;
    console.log("Port is "+ PORT);
    console.log("%cServer running", "color: green");
});