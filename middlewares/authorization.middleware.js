const { getPermissionByResourceName } = require("../repos/permission.repo"); 
const { AppError } = require("../utils/errorHandler");  
const { verifyToken } = require("../utils/jwttoken.manager");  

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new AppError('Authorization token not provided', 401));
      }

      const decoded = verifyToken(token);
      const userRole = decoded.role || decoded.userType;
      const userId = decoded.id;  // Get user ID from token

      // ✅ Allow users to read & update their own data
      if (
        ["read", "update"].includes(action) &&
        ["clerks", "managers", "cashiers", "sellers", "customers"].includes(resource) &&
        req.params[`${resource.slice(0, -1)}Id`] == userId  // Dynamic userId check
      ) {
        return next();
      }

      // 🚫 Prevent Managers from updating other Managers & Super Admins
      if (userRole === "manager" && action === "update") {
        if (req.params.managerId || req.params.superAdminId) {
          return next(new AppError("Managers cannot update other managers or super admins.", 403));
        }
        return next();
      }

      // ✅ Check if user has permission for the resource
      const permission = await getPermissionByResourceName(resource, userRole, action);

      if (!permission) {
        return next(new AppError(`You don't have permission to ${action} this ${resource}`, 403));
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again!', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Your token has expired! Please log in again.', 401));
      }

      next(error);
    }
  };
};



module.exports = checkPermission;
