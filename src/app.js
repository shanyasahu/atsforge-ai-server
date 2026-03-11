//initate the server & create instance of server and use api route here
const express = require("express");

const app = express();

app.use(express.json());

module.exports = app;
