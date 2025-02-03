const { verifyToken, decodedToken } = require("../utils/jwttoken.manager");
const {AppError} = require("../utils/errorHandler"); 

const authenticationMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; 
    if (!token) {
      return next(new AppError("Authorization token is required", 401)); 
    }

    verifyToken(token);
    const decoded = decodedToken({ token });

    
    req.user = decoded.payload;
    next(); 
  } catch (error) {
    
    return next(new AppError("Unauthenticated", 401)); 
  }
};

module.exports = authenticationMiddleware;
