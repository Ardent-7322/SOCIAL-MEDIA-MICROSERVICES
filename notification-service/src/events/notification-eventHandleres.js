
const Notificaton = require("../models/notification-model");
const {io} = require("../sockets/socket");
const logger = require("../utils/logger");

async function handleFollow(event) {
    try{
        const notification = await notification.create({
            receiverId : event.receiverId,
            senderId : event.senderId,
            type: "follow",
            message: `${event.senderUsername} started following you`
        });
        if(io) io.to(event.receiverId.toString()).emit("notification", notification);
        logger.info(`Follow notification sent: ${notification._id}`);
    }
    catch(err){
        logger.err("Error handling follow event",err)
    }
}

//like handler
// async function handleLike(event) {
//   try {
//     const notification = await Notification.create({
//       receiverId: event.receiverId,
//       senderId: event.senderId,
//       type: "like",
//       message: `${event.senderUsername} liked your post`,
//     });
//     if (io) io.to(event.receiverId.toString()).emit("notification", notification);
//     logger.info(`Like notification sent: ${notification._id}`);
//   } catch (error) {
//     logger.error("Error handling like event", error);
//   }
// }

module.exports = {handleFollow}