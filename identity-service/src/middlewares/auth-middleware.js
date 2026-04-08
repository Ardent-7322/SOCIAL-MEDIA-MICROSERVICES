const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const authenticationRequest = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Access attempted without authorization header");
    return res.status(401).json({
      success: false,
      message: "Authentication required! Please login to continue",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = { userId: decoded.userId, username: decoded.username };

    next();
  } catch (err) {
    logger.warn("Invalid or expired token");
    return res.status(401).json({
      success: false,
      message: "Authentication failed! Invalid or expired token",
    });
  }
};

module.exports = { authenticationRequest };
