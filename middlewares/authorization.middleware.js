const { getPermissionByResourceName } = require("../repos/permission.repo");  // Import the permission service
const {AppError} = require("../utils/errorHandler");  // Importing the custom error class
const { verifyToken } = require("../utils/jwttoken.manager");  // Importing verifyToken from the jwt utility

// Middleware to check if the user has permission
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Retrieve the JWT token from the Authorization header
      const token = req.headers.authorization?.split(" ")[1]; // Get the token from "Bearer <token>"

      // If no token is provided, return an error
      if (!token) {
        return next(new AppError('Authorization token not provided', 401));
      }

      // Verify the token and extract the user's role
      const decoded = verifyToken(token);  // Use the verifyToken function here
      console.log(decoded); 
     
      const userRole = decoded.role ? decoded.role : decoded.userType ;  // Assuming the token contains the user's role
     
     

      // Get the permission for the specified resource using the modified function
      const permission = await getPermissionByResourceName(resource, userRole, action);
      

      // If no permission is found, send an unauthorized response using custom error handler
      if (!permission) {
        return next(new AppError(`You don't have permission to ${action} this ${resource}`, 403));
      }

      // Proceed to the next middleware if permission is found
      next();
    } catch (error) {
      // Handle errors (e.g., invalid token, permission not found, etc.)
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again!', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Your token has expired! Please log in again.', 401));
      }
      // Pass any other errors to the next error handler
      next(error);
    }
  };
};

module.exports = checkPermission;
