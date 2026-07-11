const progressService = require("../services/importProgress.service");

function getImportProgress(req, res) {
  return res.json({
    success: true,
    data: progressService.getProgress(),
  });
}

module.exports = {
  getImportProgress,
};