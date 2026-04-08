const Notification = require("../models/notification-model");
const eventHandler = require("../events/notification-eventHandleres");
const { connectToRabbitMQ } = require("../utils/rabbitmq");
const logger = require("../utils/logger");
const { handleFollow } = require("../events/notification-eventHandleres");

// Map routing key to handlers
const eventHandlers = {
  "user.follow": handleFollow,
  // add more routing keys as needed
};

async function startEventListener() {
  const channel = await connectToRabbitMQ();
  const q = await channel.assertQueue("", { exclusive: true });

  // Bind queue to all events
  for (const routingKey of Object.keys(eventHandlers)) {
    await channel.bindQueue(q.queue, "social_app_events", routingKey);
  }

  channel.consume(q.queue, async (msg) => {
    if (!msg) return;
    const event = JSON.parse(msg.content.toString());
    const handler = eventHandlers[msg.fields.routingKey];

    if (handler) {
      try {
        await handler(event);
      } catch (err) {
        logger.error("Error in event handler:", err);
      }
    } else {
      logger.warn(`No handler for event: ${msg.fields.routingKey}`);
    }

    channel.ack(msg);
  });

  logger.info("Notification event listener started");
}

module.exports = { startEventListener };
