require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const SearchRoutes = require("./routes/search-routes");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./utils/logger");
const { connectToRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostCreated, handlePostDeleted } = require("./eventHandlers/search-event-handlers");
const {searchPostController} = require("./controllers/search-controller")
const {rateLimit} = require("express-rate-limit")

const app = express();
const PORT = process.env.PORT || 3004;

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

//*** Homework--- implement Ip based rate limiting for sensitve endpoints*/

const searchlimiter = rateLimit({
windowMs: 60*1000,
max : 20,
message:{
success : false,
message: "Too many requests from this IP, try after some time"
},
standardHeaders: true,
legacyHeaders: false,
})


app.use("/api/search",searchlimiter,SearchRoutes );

app.use(errorHandler)

async function startServer(){
  try {
    await connectToRabbitMQ()

    //consume the events / subscribe to the events 
    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT,"0.0.0.0", ()=>{
      logger.info(`Search service is running on port: ${PORT}`)
    })
  } catch (e) {
    logger.error("Failed to start search service", e)
    process.exit(1)
  }
}

startServer();