
const {AppError} = require("../utils/errorHandler");  
const { verifyToken } = require("../utils/jwttoken.manager");  



const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new AppError("Authorization token not provided", 401));
      }

      const decoded = verifyToken(token);
      const userRole = decoded.role ? decoded.role : decoded.userType;
      const userId = decoded.sub;

      // ✅ Ensure `params` exists
      req.params = req.params || {};

      // ✅ Define permission context
      const context = {
        requester: { id: userId, userType: userRole },
        params: req.params,
      };

      // ✅ Super Admin & Manager Can Do Everything
      if (["super_admin", "manager"].includes(userRole)) {
        return next(); // ✅ Allow them instantly
      }

      // ✅ Seller Can ONLY Update Their Own Profile
      if (resource === "sellers" && action === "update") {
        if (context.requester.id === context.params.sellerId) {
          return next(); // ✅ Allow Seller to Update Their Own Profile
        }
        return next(new AppError(`You don't have permission to update this seller`, 403));
      }

      return next(new AppError(`You don't have permission to ${action} this ${resource}`, 403));
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return next(new AppError("Invalid token. Please log in again!", 401));
      }
      if (error.name === "TokenExpiredError") {
        return next(new AppError("Your token has expired! Please log in again.", 401));
      }
      return next(error);
    }
  };
};












module.exports = checkPermission;
