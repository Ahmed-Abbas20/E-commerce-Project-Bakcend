const express = require("express");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const MemoController =require("./controllers/Memo.controller");
const authenticationMiddleware = require("./middlewares/authentication.middleware");
const authController = require("./controllers/auth.controller");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(morgan("common"));

app.use(express.json());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: false,
    preserveExtension: true,
  })
);
app.use("/auth", authController);
app.use("/memories",[authenticationMiddleware], MemoController);

const controllersDirPath = path.join(__dirname, "controllers");
const controllersDirectory = fs.readdirSync(controllersDirPath);

for (const controllerFile of controllersDirectory) {
  const controller = require(path.join(controllersDirPath, controllerFile));
  app.use(controller);
}

module.exports = app;
