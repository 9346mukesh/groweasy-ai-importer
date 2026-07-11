"use client";

import { useState } from "react";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import {
  CRM_TABLE_COLUMNS,
  PREVIEW_RESULT_LIMIT,
} from "@/lib/crm";

import ImportedLeadTable from "./ImportedLeadTable";
import LeadDetailsDrawer from "./LeadDetailsDrawer";
import StatusBadge from "./StatusBadge";

function formatCellValue(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function ResultDataTable({
  title,
  description,
  columns,
  rows,
  emptyMessage,
  variant = "default",
}) {
  const previewRows = rows.slice(
    0,
    PREVIEW_RESULT_LIMIT
  );

  const isTruncated =
    rows.length > PREVIEW_RESULT_LIMIT;

  return (
    <Card className="overflow-hidden py-0">

      <CardHeader className="border-b bg-muted/30 py-4">

        <CardTitle className="text-base">
          {title}
        </CardTitle>

        <CardDescription>
          {description}

          {isTruncated &&
            ` · Showing first ${PREVIEW_RESULT_LIMIT.toLocaleString()} of ${rows.length.toLocaleString()}`}
        </CardDescription>

      </CardHeader>

      <CardContent className="p-0">

        {rows.length === 0 ? (

          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>

        ) : (

          <div
            className="max-h-[500px] overflow-auto"
            role="region"
            aria-label={title}
          >

            <table className="w-full min-w-max text-sm">

              <TableHeader className="sticky top-0 z-20 bg-muted">

                <TableRow>

                  {columns.map((column, index) => (

                    <TableHead
                      key={column.key}
                      className={cn(
                        "min-w-[140px]",

                        index === 0 &&
                          "sticky left-0 z-30 bg-muted border-r",

                        column.key === "reason" &&
                          "min-w-[260px]"
                      )}
                    >
                      {column.label}
                    </TableHead>

                  ))}

                </TableRow>

              </TableHeader>

              <TableBody>

                {previewRows.map((row, rowIndex) => (

                  <TableRow key={rowIndex}>

                    {columns.map((column, colIndex) => {

                      const value = formatCellValue(
                        row[column.key]
                      );

                      return (

                        <TableCell
                          key={column.key}
                          className={cn(
                            "max-w-[260px]",

                            colIndex === 0 &&
                              "sticky left-0 bg-background border-r",

                            variant === "skipped" &&
                              column.key === "reason" &&
                              "text-amber-600"
                          )}
                          title={value}
                        >

                          <span className="block truncate">
                            {value || "—"}
                          </span>

                        </TableCell>

                      );
                    })}

                  </TableRow>

                ))}

              </TableBody>

            </table>

          </div>

        )}

      </CardContent>

    </Card>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}) {
  const toneClasses = {
    default: "text-foreground",
    success:
      "text-emerald-600 dark:text-emerald-400",
    warning:
      "text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="rounded-xl border bg-background p-4">

      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          toneClasses[tone]
        )}
      >
        {value.toLocaleString()}
      </p>

    </div>
  );
}

export function ParsedResultView({ result, onReset }) {
  const data = result?.data ?? {};

  const imported = data.imported ?? [];
  const skipped = data.skipped ?? [];

  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openLead(lead) {
    setSelectedLead(lead);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedLead(null);
  }

  return (
    <div className="space-y-6">

      {/* Summary */}

      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">

        <CardHeader>

          <CardTitle className="text-base">
            Import Results
          </CardTitle>

          <CardDescription>
            {result?.message}
          </CardDescription>

        </CardHeader>

        <CardContent>

          <div className="grid gap-4 md:grid-cols-3">

            <StatCard
              label="Total Imported"
              value={data.totalImported ?? 0}
              tone="success"
            />

            <StatCard
              label="Total Skipped"
              value={data.totalSkipped ?? 0}
              tone={
                data.totalSkipped > 0
                  ? "warning"
                  : "default"
              }
            />

            <StatCard
              label="Rows Processed"
              value={data.totalRows ?? 0}
            />

          </div>

          {data.mappingMethod === "ai-batch" && (

            <div className="mt-5 rounded-lg border bg-background p-4">

              <div className="flex flex-wrap gap-6 text-sm">

                <div>
                  <span className="font-medium">
                    AI Model
                  </span>

                  <p className="text-muted-foreground">
                    {data.model}
                  </p>
                </div>

                <div>
                  <span className="font-medium">
                    Batch Size
                  </span>

                  <p className="text-muted-foreground">
                    {data.batchSize}
                  </p>
                </div>

                <div>
                  <span className="font-medium">
                    Total Batches
                  </span>

                  <p className="text-muted-foreground">
                    {data.batchCount}
                  </p>
                </div>

                <div>
                  <span className="font-medium">
                    Extraction
                  </span>

                  <p className="text-green-600 font-semibold">
                    AI Batch
                  </p>
                </div>

              </div>

            </div>

          )}

        </CardContent>

      </Card>

      {/* Imported Leads */}

      <Card className="overflow-hidden">

        <CardHeader className="border-b">

          <div className="flex items-center justify-between">

            <div>

              <CardTitle>
                Successfully Parsed Records
              </CardTitle>

              <CardDescription>
                {imported.length.toLocaleString()} CRM Ready
                Lead
                {imported.length === 1 ? "" : "s"}
              </CardDescription>

            </div>

          </div>

        </CardHeader>

        <CardContent className="p-0">

          <ImportedLeadTable
            rows={imported}
            onView={openLead}
          />

        </CardContent>

      </Card>

      {/* Drawer */}

      <LeadDetailsDrawer
        open={drawerOpen}
        lead={selectedLead}
        onClose={closeDrawer}
      />
            {/* Skipped Records */}

      {skipped.length > 0 && (

        <ResultDataTable
          title="Skipped Records"
          description={`${skipped.length.toLocaleString()} row${
            skipped.length === 1 ? "" : "s"
          } could not be imported`}
          columns={[
            {
              key: "rowIndex",
              label: "#",
            },
            {
              key: "reason",
              label: "Skip Reason",
            },
            {
              key: "originalPreview",
              label: "Original Data",
            },
          ]}
          rows={skipped.map((row) => ({
            ...row,
            originalPreview: Object.entries(
              row.original ?? {}
            )
              .map(([key, value]) => `${key}: ${value}`)
              .join(" | "),
          }))}
          emptyMessage="No skipped records."
          variant="skipped"
        />

      )}

      {/* Footer */}

      <div className="flex items-center justify-between">

        <div className="text-sm text-muted-foreground">

          Showing{" "}
          <span className="font-semibold">
            {imported.length.toLocaleString()}
          </span>{" "}
          imported record
          {imported.length === 1 ? "" : "s"}

          {skipped.length > 0 && (
            <>
              {" "}
              and{" "}
              <span className="font-semibold text-amber-600">
                {skipped.length.toLocaleString()}
              </span>{" "}
              skipped record
              {skipped.length === 1 ? "" : "s"}.
            </>
          )}

        </div>

        <Button
          variant="outline"
          onClick={onReset}
        >
          Import Another File
        </Button>

      </div>

    </div>
  );
}