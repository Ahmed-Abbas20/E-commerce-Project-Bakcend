const jwt = require("jsonwebtoken");

// sign token

module.exports.signToken = ({ claims }) => {
  return jwt.sign(claims, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "1d",
  });
};

// verify token
module.exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// decode token
module.exports.decodedToken = ({token}) => {
  return jwt.decode(token, { complete: true });
};
