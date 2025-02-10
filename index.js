const express = require("express");
const morgan = require("morgan");
const authController = require("./controllers/auth.controller");
const usersController = require("./controllers/user.controller");
const categoryController = require('./controllers/category.controller');
const productController = require('./controllers/product.controller');
const authenticationMiddleware = require("./middlewares/authentication.middleware");
const {  errorHandler } = require('./utils/errorHandler'); 
const { notFound } = require('./utils/notFound'); 
const cartController = require("./controllers/cart.controller");





const app = express();

app.use(morgan("common"));

app.use(express.json());

app.use("/auth", authController);
app.use("/users", [authenticationMiddleware,],usersController);

app.use('/categories', [authenticationMiddleware],categoryController);
app.use('/products', [authenticationMiddleware],productController);

app.use("/carts", [authenticationMiddleware], cartController);
app.use(notFound);
// Error handling
app.use(errorHandler);

// 404 handler
app.all('*', (req, res, next) => {
    const err = new errorHandler.AppError(
        `Can't find ${req.originalUrl} on this server!`,
        404
    );
    next(err);
});

module.exports = app;
