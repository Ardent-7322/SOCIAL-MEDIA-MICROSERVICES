require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mediaRoutes = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3003;

//connect to mongodb

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("connected to mongodb"))
  .catch((e) => logger.error("Error while connecting to mongodb", e));

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

//*** Homework - implement Ip based rate limiting for sensitive endpoints

app.use("/api/media", mediaRoutes);

app.use(errorHandler)

app.listen(PORT, ()=>{
    logger.info(`Identify service running on port ${PORT}`)
})

//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});