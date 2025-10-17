const express = require("express");
const { registerUser, loginUser, logoutUser, refreshTokenUser, } = require("../controllers/identity-controller");
const {toggleFollow} = require("../controllers/follow-controller");
const {authenticationRequest} = require("../middlewares/auth-middleware")

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refreshToken", refreshTokenUser)
router.post("/followUser", authenticationRequest, toggleFollow)

module.exports = router;
