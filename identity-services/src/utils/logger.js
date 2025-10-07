const winston = require("winston");

// Create a reusable logger instance for the entire application
const logger = winston.createLogger({
  // Set logging level based on environment
  // - In production → only log info and above
  // - In development → also log debug (more detailed)
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  // Define the log format
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to each log
    winston.format.errors({ stack: true }), // Capture full stack trace for errors
    winston.format.splat(), // String interpolation support (printf-style)
    winston.format.json() // Log output in JSON (structured, easy to parse by log tools)
  ),

  // Default metadata added to every log (helps identify service in microservices architecture)
  defaultMeta: { service: "identity-service" },

  // Define where logs will be sent (called "transports") // output destination
  transports: [
    // 1. Console logs (useful in development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Add colors to log levels (error=red, info=green, etc.)
        winston.format.simple() // Human-readable, concise logs
      ),
    }),

    // 2. File logs: capture only error-level logs into error.log (production debugging)
    new winston.transports.File({ filename: "error.log", level: "error" }),

    // 3. File logs: capture all logs into combined.log (full history)
    new winston.transports.File({ filename: "combined.log" }),
  ],
});


module.exports = logger;
