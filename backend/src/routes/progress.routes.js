const express = require("express");

const router = express.Router();

const {
  getImportProgress,
} = require("../controllers/progress.controller");

router.get("/", getImportProgress);

module.exports = router;