const express = require("express");
const morgan = require("morgan");
const authController = require("./controllers/auth.controller");
const usersController = require("./controllers/user.controller");
const categoryController = require('./controllers/category.controller');
const productController = require('./controllers/product.controller');
const authenticationMiddleware = require("./middlewares/authentication.middleware");


const { notFound, errorHandler } = require('./middlewares/error.midllewares');

const app = express();

app.use(morgan("common"));

app.use(express.json());

app.use("/auth", authController);
app.use("/users", [authenticationMiddleware,],usersController);

app.use('/categories', [authenticationMiddleware],categoryController);
app.use('/products', [authenticationMiddleware],productController);

/* app.use(notFound); */
/* app.use(errorHandler); */

module.exports = app;
