const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);  // Create a new error with a custom message.
    error.statusCode = 404;  
    next(error);  
  };
  
  
  
  module.exports.notFound= notFound;  
  