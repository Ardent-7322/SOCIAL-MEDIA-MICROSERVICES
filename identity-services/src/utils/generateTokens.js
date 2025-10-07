const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/Refresh-token");

const generateTokens = async (user) => {
  // Generate access token
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Generate refresh token
  const refreshToken = crypto.randomBytes(40).toString("hex");

  // Set expiration date for refresh token (15 days)
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + 15);

  // Save refresh token in DB
  await RefreshToken.create({
    token: refreshToken,  // ✅ Corrected
    user: user._id,
    expiredAt,
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
