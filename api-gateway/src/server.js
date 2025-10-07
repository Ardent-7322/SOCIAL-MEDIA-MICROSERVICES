require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const logger = require("./utils/logger.api-gateway");
const errorHandler = require("./middlewares/errorHandler.api-gateway");
const proxy = require("express-http-proxy");

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

//rate limiting

const rateLimitOptions = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoints rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(rateLimitOptions);

// Logging middleware
app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  next();
});

// Proxy options for Identity Service
const identityProxyOptions = {
  proxyReqPathResolver: (req) => {
    // Replace /v1 with /api for internal service
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Identity service: ${proxy.statusCode}`);
    return proxyResData;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
      details:err,
    });
  },
};

//Setting up proxy for our identity service

app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_SERVICE_URL, identityProxyOptions)
);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway is runnig on port ${PORT}`);
  logger.info(
    `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(`Redis url is running on port ${process.env.REDIS_URL}`);
});

//NOTE--->
// api-gateway -> /v1/auth/register ->3000
// identity -> /api/auth/register ->3001

// localhost:3000/v1/auth/register -> localhost:3001/api/auth/register

// here v1 -> will replace with api/auth/register (from identity-service)
