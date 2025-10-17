const mongoose = require("mongoose");
const User = require("../models/user-model");
const logger = require("../utils/logger");

const toggleFollow = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user.userId; // comes from auth middleware

    if (!targetUserId) {
      logger.error("The user you want to follow not found");
      return res.status(400).json({
        success: false,
        message: "targetUserId is required",
      });
    }
    // if current user entered his own id
    if (currentUserId.toString() === targetUserId) {
      logger.warn(`User tried to follow themselves :${currentUserId}`);
      return res.status(400).json({
        status: false,
        message: "you can not follow yourself",
      });
    }

    const session = await mongoose.startSession();
    session.startSession();

    try {
      const currentUser = await User.findById(currentUserId).session(session);
      const targetUser = await User.findById(targetUserId).session(session);

      if (!currentUser || !targetUser) {
        await session.abortTransaction();
        session.endSession();
        logger.warn(
          `User not found. Current :${currentUserId}, Target: ${targetUserId}`
        );
        return res.status(404).json({ message: "User not found" });
      }

      const isFollowing = currentUser.following.includes(targetUserId);
      let message;

      if (isFollowing) {
        // Unfollow
        currentUser.following = currentUser.following.filter(
          (id) => id.toString() !== targetUserId
        );
        targetUser.followers = targetUser.followers.filter(
          (id) => id.toString() !== currentUserId.toString()
        );
        message = "User unfollowed successfully";
      } else {
        // Follow
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);
        message = "User followed successfully";
      }

      await currentUser.save({ session });
      await targetUser.save({ session });

      await session.commitTransaction();
      session.endSession();

      // publish event to notifiaction

      const event = action === "followed" ? "user.followed" : "user.unfollowed";
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error("Follow transaction failed:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } catch (error) {
    logger.error("Toggle follow error", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {toggleFollow}
