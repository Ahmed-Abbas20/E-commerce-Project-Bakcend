const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);  // Create a new error with a custom message.
    error.statusCode = 404;  // Explicitly set the statusCode to 404.
    next(error);  // Pass the error to the next middleware (which will handle it).
  };
  
  
  
  module.exports.notFound= notFound;  
  