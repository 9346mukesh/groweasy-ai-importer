const multer = require("multer");
const { MAX_FILE_SIZE } = require("../services/csvParser.service");

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const isCsv = file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      return callback(new Error("Only .csv files are allowed."));
    }

    callback(null, true);
  },
});

function handleUploadError(error, req, res, next) {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 10MB limit.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Only one CSV file can be uploaded at a time.",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || "Failed to upload CSV file.",
  });
}

function optionalCsvUpload(req, res, next) {
  if (!req.is("multipart/form-data")) {
    return next();
  }

  return csvUpload.single("file")(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    return next();
  });
}

function requireCsvUpload(req, res, next) {
  return csvUpload.single("file")(req, res, (error) => {
    if (error) {
      return handleUploadError(error, req, res, next);
    }

    return next();
  });
}

module.exports = {
  csvUpload,
  handleUploadError,
  optionalCsvUpload,
  requireCsvUpload,
};
