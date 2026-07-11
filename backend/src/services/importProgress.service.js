let progress = {
  currentBatch: 0,
  totalBatches: 0,
  percentage: 0,
  status: "idle",
};

function start(totalBatches) {
  progress = {
    currentBatch: 0,
    totalBatches,
    percentage: 0,
    status: "processing",
  };
}

function update(currentBatch) {
  progress.currentBatch = currentBatch;
  progress.percentage = Math.round(
    (currentBatch / progress.totalBatches) * 100
  );
}

function finish() {
  progress.currentBatch = progress.totalBatches;
  progress.percentage = 100;
  progress.status = "completed";
}

function getProgress() {
  return progress;
}

module.exports = {
  start,
  update,
  finish,
  getProgress,
};