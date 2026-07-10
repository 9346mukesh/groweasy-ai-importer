const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  optionalCsvUpload,
  requireCsvUpload,
} = require("../middleware/upload.middleware");
const { uploadCsv, importCsv } = require("../controllers/import.controller");

const router = express.Router();

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many import requests. Please try again later.",
  },
});

router.post("/upload", importLimiter, requireCsvUpload, uploadCsv);
router.post("/", importLimiter, optionalCsvUpload, importCsv);

module.exports = router;
