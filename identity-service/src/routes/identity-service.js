const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenUser,
  getUserProfile,
  getUserConnections,
  getAllUsers,
} = require("../controllers/identity-controller");
const { toggleFollow } = require("../controllers/follow-controller");
const { authenticationRequest } = require("../middlewares/auth-middleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refreshToken", refreshTokenUser);
router.post("/follow", authenticationRequest, toggleFollow);
router.get("/:userId", authenticationRequest, getUserProfile);
router.get("/:userID/connections", authenticationRequest, getUserConnections)

module.exports = router;
