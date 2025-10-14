require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const postRoutes = require("./routes/post-routes");
const errorHandler = require("./middlewares/errorHandler");
const { connectToRabbitMQ } = require("./utils/rabbitmq");


const app = express();
const PORT = process.env.PORT || 3002;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("Connected to mongoDB"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

//Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} requested to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

// IP based rate limiting for sensitive endpoints

// (for high risk endpoints - (post / delete by id))
const highRiskLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      `High-risk rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`
    );
    res.status(429).json({
      success: false,
      message: "Too many request. Try after some time again",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// medium risk (Get post by ID)
const mediumRiskLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      `Medium-risk rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`
    );
    res
      .status(429)
      .json({ success: false, message: "Too many requests. Slow down!" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// Low-risk endpoints (get all posts)
const lowRiskLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      `Low-risk rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`
    );
    res
      .status(429)
      .json({ success: false, message: "Too many requests. Slow down!" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

//routes to rate limiter
app.use("/posts", (req, res, next) => {
  // Apply limiter based on risk
  if (req.method === "POST" || req.method === "DELETE")
    return highRiskLimiter(req, res, next);
  if (req.method === "GET" && req.params.id)
    return mediumRiskLimiter(req, res, next); // sensitive read
  if (req.method === "GET") return lowRiskLimiter(req, res, next); // public read
  next();
});

// NOTE : This means any request starting with /posts (e.g., /posts, /posts/123)
// will first hit this middleware before it reaches the actual routes in postRoutes.

//routes --> pass redisClient to routes
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

app.use(errorHandler);

async function startServer() {
  try {
    await connectToRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Post service running on port ${PORT}`);
    });
  } catch (e) {
    logger.error("Failed to connect to server", e);
    process.exit(1);
  }
}
startServer();

//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason", reason);
});
