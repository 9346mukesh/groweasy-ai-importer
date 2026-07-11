"use client";

export default function AiProcessingProgress({
  currentBatch,
  totalBatches,
}) {
  const progress =
    totalBatches === 0
      ? 0
      : Math.round((currentBatch / totalBatches) * 100);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <h3 className="text-lg font-semibold">
        AI Processing
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        AI is extracting CRM fields...
      </p>

      <div className="mt-5 h-3 rounded-full bg-gray-200 overflow-hidden">

        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <div className="mt-4 flex justify-between text-sm">

        <span>
          Batch {currentBatch} of {totalBatches}
        </span>

        <span>{progress}%</span>

      </div>

    </div>
  );
}
