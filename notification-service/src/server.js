require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http")
const { startEventListener } = require("./events/notification-evenntListner");
const { connectToRabbitMQ } = require("./utils/rabbitmq");
const { setupSocketServer } = require("./sockets/socket");
const logger = require("./utils/logger");


const app = express();
app.use(express.json());
const server = http.createServer(app);
const PORT = process.env.PORT || 3005;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info("MongoDB connected"))
  .catch(err => logger.error("MongoDB connection error", err));

// Initialize Socket.IO
setupSocketServer(server);

async function startServer() {
  try {
    await connectToRabbitMQ();
    await startEventListener();//start listining to events

    server.listen(PORT, "0.0.0.0", ()=>{
      logger.info(`Notification service is running on port ${PORT}`);
    });

  } catch (err) {
    logger.error("Error starting notification service:", err);
  }
}

startServer();
