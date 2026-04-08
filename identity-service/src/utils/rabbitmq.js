const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;
const EXCHANGE_NAME = "social_app_events";

// Connect to RabbitMQ
async function connectToRabbitMQ() {
    try {
        if (channel) return channel; // already connected

        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });

        logger.info("Connected to RabbitMQ");
        return channel;
    } catch (error) {
        logger.error('Error connecting to RabbitMQ', error);
        throw error;
    }
}

// Publish an event
async function publishEvent(routingKey, message) {
    if (!channel) await connectToRabbitMQ();

    channel.publish(
        EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(message))
    );
    logger.info(`Event published: ${routingKey}`);
}

// Consume events from a routing key (generic)
async function consumeEvent(routingKey, handler) {
    if (!channel) await connectToRabbitMQ();

    const q = await channel.assertQueue('', { exclusive: true }); // temporary queue
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    channel.consume(q.queue, (msg) => {
        if (msg.content) {
            const event = JSON.parse(msg.content.toString());
            handler(event);
        }
    }, { noAck: true });

    logger.info(`Listening to events on: ${routingKey}`);
}

module.exports = { connectToRabbitMQ, publishEvent, consumeEvent };
