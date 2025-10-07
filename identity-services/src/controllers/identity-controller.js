// on any production level project you will need a logger
const RefreshToken = require("../models/Refresh-token");
const User = require("../models/user-model");
const { log } = require("winston");
const logger = require("../utils/logger");
const { validateRegistration, validatelogin } = require("../utils/validation");
const generateTokens = require("../utils/generateTokens");

// user registration
const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit...");
  try {
    //validate schema i.e you're receiving correct info or not
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    //new user

    user = new User({ username, email, password });
    await user.save(); // _id will get from here
    logger.warn("User saved successfully", user._id);

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration error occured", error);
    res.status(500).json({
      success: false,
      message: "Interal server error ",
    });
  }
};


//user login
const loginUser = async (req, res) => {
  logger.info("Login endpoint hits...");
  try {
    const { error } = validatelogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("User not exists");
      return re.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    //if user is present -> validate password or not?
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Incorrect Password");
      return re.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    res.json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (e) {
    logger.error("login error occured", e);
    res.status(500).json({
      success: false,
      message: "Interal server error ",
    });
  }
};


//refresh token
const refreshTokenUser = async (req, res) => {
  logger.info("Refresh Token endpoint hits...");

  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    // const storedToken = await RefreshToken.deleteOne({token : refreshToken})

    if (!storedToken) {
      logger.warn("Invalid refresh token provided");
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (!storedToken || storedToken.expiredAt < new Date()) {
      logger.warn("Invalid pr expired refresh token");

      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // if token is correct
    const user = await User.findById(storedToken.user);

    if (!user) {
      logger.warn("User not found");
      return res.status(401).json({
        success: false,
        message: "User not Found",
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    //delete the old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (e) {
    logger.error("login error occured", e);
    res.status(500).json({
      success: false,
      message: "Interal server error ",
    });
  }
};


//logout
const logoutUser = async(req, res) => {
  logger.info("Logout User endpoint hits...");
  try {
    const { refreshToken } = req.body;
    if(!refreshToken) {
      logger.warn("Refresh Token missing");
      return res.status(400).json({
        success : false,
        message : "Refresh token missing"
      })
    }

    const storedToken = await RefreshToken.findOneAndDelete({
      token : refreshToken,
    })

    if(!storedToken) {
      logger.warn("Invalid refresh token provided");
      return res.status(400).json({
        success : false,
        message : "Invalid refresh token",
      })
    }
    logger.info("Refresh token deleted for logour");

    res.json({
      success : true,
      message : "Logged Out Succesfully!"
    })
    
  } catch (e) {
    logger.error("logout error occured", e);
    res.status(500).json({
      success: false,
      message: "Interal server error ",
    });
  }
}

module.exports = { registerUser, loginUser, refreshTokenUser , logoutUser};
