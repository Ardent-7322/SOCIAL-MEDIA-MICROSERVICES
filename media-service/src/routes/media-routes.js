const express = require("express");
const multer = require("multer");
const { uploadMedia, getAllMedias } = require("../controllers/media-controller");
const { authenticationRequest } = require("../middleware/auth-middleware");
const logger = require("../utils/logger");

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 5 * 1024 * 1024, // 5 MB max
  },
}).single("file");

// Upload single media (High Risk)
router.post(
  "/upload",
  authenticationRequest,
   // rate limit for upload
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error("Multer error while uploading:", err);
        return res.status(400).json({
          message: "Multer error while uploading:",
          error: err.message,
          stack: err.stack,
        });
      } else if (err) {
        logger.error("Unknown error occured while uploading:", err);
        return res.status(500).json({
          message: "Unknown error occured while uploading:",
          error: err.message,
          stack: err.stack,
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file found!" });
      }

      next(); // proceed to uploadMedia controller
    });
  },
  uploadMedia
);

router.get("/get", authenticationRequest, getAllMedias);

module.exports = router;
