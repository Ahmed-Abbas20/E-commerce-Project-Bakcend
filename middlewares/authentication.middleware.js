const { verifyToken, decodedToken } = require("../utils/jwttoken.manager");

const authenticationMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    verifyToken(token);
    const decoded = decodedToken({ token });
    req.user = decoded.payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthenticated" });
  }
};

module.exports = authenticationMiddleware;
