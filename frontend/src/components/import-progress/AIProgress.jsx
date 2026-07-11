"use client";

import { Progress } from "@/components/ui/progress";

export default function AIProgress({
  percentage,
  currentBatch,
  totalBatches,
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex justify-between mb-2">

        <h3 className="font-semibold">
          AI Processing
        </h3>

        <span className="text-sm text-muted-foreground">
          {percentage}%
        </span>

      </div>

      <Progress value={percentage} />

      <p className="mt-3 text-sm text-muted-foreground">

        Processing Batch {currentBatch} of {totalBatches}

      </p>

    </div>
  );
}