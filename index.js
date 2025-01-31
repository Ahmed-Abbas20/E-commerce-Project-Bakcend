const express = require("express");
const morgan = require("morgan");
const authController = require("./controllers/auth.controller");
const usersController = require("./controllers/user.controller");

const app = express();

app.use(morgan("common"));

app.use(express.json());

app.use("/auth", authController);
app.use("/users", usersController);

module.exports = app;
