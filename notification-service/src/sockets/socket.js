// socket.js
const { Server } = require("socket.io");
const logger = require("../utils/logger");

let io;

function setupSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
      logger.info(`User ${userId} connected to socket`);
    }

    socket.on("disconnect", () => {
      logger.info(`User ${userId} disconnected`);
    });
  });
}

module.exports = { setupSocketServer, io };
