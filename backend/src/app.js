const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const importRoutes = require("./routes/import.routes");
const progressRoutes = require("./routes/progress.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GrowEasy AI Importer API is running 🚀",
  });
});

app.use("/api/import", importRoutes);
app.use("/api/import/progress", progressRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "An unexpected error occurred. Please try again."
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;