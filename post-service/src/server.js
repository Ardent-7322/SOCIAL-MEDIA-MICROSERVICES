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
const postRoutes = require('./routes/post-routes');
const errorHandler = require('./middlewares/errorHandler');


const app = express();
const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.MONGO_URI).then(()=> logger.info("Connected to mongoDB")).catch((e)=> logger.error("Mongo connection error", e));

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



//routes 