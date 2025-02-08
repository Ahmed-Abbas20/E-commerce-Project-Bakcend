const express = require("express");
const morgan = require("morgan");
const authController = require("./controllers/auth.controller");
const usersController = require("./controllers/user.controller");
const categoryController = require('./controllers/category.controller');
const productController = require('./controllers/product.controller');
const authenticationMiddleware = require("./middlewares/authentication.middleware");
const managerController=require('./controllers/manager.controller');
const {  errorHandler } = require('./utils/errorHandler'); 
const { notFound } = require('./utils/notFound'); 
const fileUpload = require("express-fileupload");

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

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:4200', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  }));
  

app.use("/auth", authController);
app.use("/users", [authenticationMiddleware,],usersController);

app.use('/categories', [authenticationMiddleware],categoryController);
app.use('/products', [authenticationMiddleware],productController);
app.use('/managers', [authenticationMiddleware],managerController);



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
