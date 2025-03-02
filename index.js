const express = require("express");
const morgan = require("morgan");
const authController = require("./controllers/auth.controller");
const customersController = require("./controllers/customer.controller");
const sellersController = require("./controllers/seller.controller");
const managersController = require("./controllers/manager.controller");
const cashiersController = require("./controllers/cashier.controller");
const categoryController = require('./controllers/category.controller');
const productcontroller = require('./controllers/product.controller');
const branchController = require('./controllers/branch.controller');
const requestController = require('./controllers/request.controller');
const websiteController = require('./controllers/website.controller');
const authenticationMiddleware = require("./middlewares/authentication.middleware");
const { errorHandler } = require('./utils/errorHandler');
const { notFound } = require('./utils/notFound');
const fileUpload = require("express-fileupload");
const cartController = require("./controllers/cart.controller");
const orderController = require("./controllers/order.controller");
const cors = require('cors');

const app = express();

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: false,
    preserveExtension: true,
  })
);

app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use("/auth", authController);
app.use("/customers", [authenticationMiddleware], customersController);
app.use("/sellers", [authenticationMiddleware], sellersController);
app.use("/managers", [authenticationMiddleware], managersController);
app.use("/cashiers", [authenticationMiddleware], cashiersController);
app.use("/carts", [authenticationMiddleware], cartController);
app.use('/categories', [authenticationMiddleware], categoryController);
app.use('/products', [authenticationMiddleware], productcontroller);
app.use('/managers', [authenticationMiddleware], managersController);
app.use('/branches', [authenticationMiddleware], branchController);
app.use('/orders', [authenticationMiddleware], orderController);
app.use('/requests', [authenticationMiddleware], requestController);
app.use('/online', websiteController);

app.use(notFound);
app.use(errorHandler);

app.all('*', (req, res, next) => {
  const err = new errorHandler.AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
});

module.exports = app;