const mongoose = require("mongoose");
const {AppError} = require("../utils/errorHandler");  // Import the custom error class from utils



const connectToMongo = async (url, callback) => {
  try {
    await mongoose.connect(url);
    process.nextTick(() => {
      callback();
    });
  } catch (error) {
    // Log the error for debugging
    console.log(error?.message);
    // Throw a custom error using AppError class to handle it in the error handler
    throw new AppError("Internal server error, can't connect to mongodb", 500);
  }
};

module.exports.DATA_BASE = {
  connectToMongo,
};
