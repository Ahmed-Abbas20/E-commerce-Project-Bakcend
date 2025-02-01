const { getPermissionByResourceName } = require("../repos/permissions.repo");  // Import the permission service
const AppError = require("../utils/appError");  // Importing the custom error class

// Middleware to check if the user has permission
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Retrieve user role from the request (typically from the JWT token)
      const userRole = req.user.role; // Make sure the user's role is attached to the request (e.g., from the JWT)

      // Get the permission for the specified resource
      const permission = await getPermissionByResourceName(resource);

      // Check if the action is allowed for this resource and if the user's role is in the allowed roles
      if (!permission || !permission.action.includes(action) || !permission.condition.role.IN.includes(userRole)) {
        // If no matching permission, send an unauthorized response using custom error handler
        return next(new AppError(`You don't have permission to ${action} this ${resource}`, 403));
      }

      // Proceed to the next middleware if permission is found
      next();
    } catch (error) {
      // Pass the error to the error handler
      next(error);
    }
  };
};

module.exports = checkPermission;
