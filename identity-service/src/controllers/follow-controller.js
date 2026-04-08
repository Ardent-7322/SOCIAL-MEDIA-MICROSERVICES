const mongoose = require("mongoose");
const User = require("../models/user-model");
const logger = require("../utils/logger");
const { publishEvent} = require("../utils/rabbitmq"); // ✅ Import RabbitMQ publisher

const toggleFollow = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user.userId; // from auth middleware

    if (!targetUserId) {
      logger.error("The user you want to follow not found");
      return res.status(400).json({
        success: false,
        message: "targetUserId is required",
      });
    }

    if (currentUserId.toString() === targetUserId) {
      logger.warn(`User tried to follow themselves: ${currentUserId}`);
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Ensure target user exists
      const targetExists = await User.exists({ _id: targetUserId }).session(session);
      if (!targetExists) {
        await session.abortTransaction();
        session.endSession();
        logger.warn(`Target user not found: ${targetUserId}`);
        return res.status(404).json({ success: false, message: "Target user not found" });
      }

      // Check if already following
      const isFollowing = await User.exists({
        _id: currentUserId,
        following: targetUserId,
      }).session(session);

      let message;

      if (isFollowing) {
        //  Unfollow
        await User.updateOne(
          { _id: currentUserId },
          { $pull: { following: targetUserId } }
        ).session(session);

        await User.updateOne(
          { _id: targetUserId },
          { $pull: { followers: currentUserId } }
        ).session(session);

        message = "User unfollowed successfully";
        logger.info(`User ${currentUserId} unfollowed ${targetUserId}`);
      } else {
        //  Follow
        await User.updateOne(
          { _id: currentUserId },
          { $push: { following: targetUserId } }
        ).session(session);

        await User.updateOne(
          { _id: targetUserId },
          { $push: { followers: currentUserId } }
        ).session(session);

        message = "User followed successfully";
        logger.info(`User ${currentUserId} followed ${targetUserId}`);

        //  Publish event to RabbitMQ for Notification Service
        const event = {
          type: "USER_FOLLOWED",
          data: {
            followerId: currentUserId,
            followedId: targetUserId,
            timestamp: new Date().toISOString(),
          },
        };

        await publishEvent("notification_events", JSON.stringify(event));
        logger.info(` Follow event published: ${JSON.stringify(event)}`);
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      logger.error("Follow transaction failed:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  } catch (err) {
    logger.error("Toggle follow error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { toggleFollow };
