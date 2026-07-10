"use client";

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
import { PREVIEW_RESULT_LIMIT } from "@/lib/crm";

function formatCellValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
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
  const previewRows = rows.slice(0, PREVIEW_RESULT_LIMIT);
  const isTruncated = rows.length > PREVIEW_RESULT_LIMIT;

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b bg-muted/30 py-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          {description}
          {isTruncated
            ? ` · Showing first ${PREVIEW_RESULT_LIMIT.toLocaleString()} of ${rows.length.toLocaleString()}`
            : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div
            className="max-h-[min(50vh,480px)] overflow-auto"
            role="region"
            aria-label={title}
            tabIndex={0}
          >
            <table className="w-full min-w-max caption-bottom text-sm">
              <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-sm shadow-[0_1px_0_0_var(--border)]">
                <TableRow className="border-b-0 hover:bg-transparent">
                  {columns.map((column, index) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "min-w-[120px] px-3 font-semibold",
                        index === 0 && "sticky left-0 z-30 min-w-[3rem] border-r bg-muted/95 text-center backdrop-blur-sm",
                        column.key === "reason" && "min-w-[220px]",
                        variant === "skipped" &&
                          column.key === "reason" &&
                          "text-amber-700 dark:text-amber-400"
                      )}
                      title={column.label}
                    >
                      <span className="block truncate">{column.label}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {previewRows.map((row, rowIndex) => (
                  <TableRow key={`${row.rowIndex ?? rowIndex}-${rowIndex}`} className="group">
                    {columns.map((column, colIndex) => {
                      const value = formatCellValue(row[column.key]);

                      return (
                        <TableCell
                          key={`${rowIndex}-${column.key}`}
                          className={cn(
                            "max-w-[280px] px-3",
                            colIndex === 0 &&
                              "sticky left-0 z-10 border-r bg-background text-center text-xs font-medium text-muted-foreground group-hover:bg-muted/50",
                            column.key === "reason" &&
                              "text-amber-700 dark:text-amber-400"
                          )}
                          title={value}
                        >
                          <span className="block truncate">
                            {value || (column.key === "rowIndex" ? row.rowIndex : "—")}
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

function StatCard({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "text-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", toneClasses[tone])}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export function ParsedResultView({ result, onReset }) {
  const data = result?.data ?? {};
  const imported = data.imported ?? [];
  const skipped = data.skipped ?? [];

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <CardHeader>
          <CardTitle className="text-base">Import results</CardTitle>
          <CardDescription>{result?.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Total imported"
              value={data.totalImported ?? 0}
              tone="success"
            />
            <StatCard
              label="Total skipped"
              value={data.totalSkipped ?? 0}
              tone={data.totalSkipped > 0 ? "warning" : "default"}
            />
            <StatCard label="Total rows processed" value={data.totalRows ?? 0} />
          </div>
        </CardContent>
      </Card>

      <ResultDataTable
        title="Successfully parsed records"
        description={`${imported.length.toLocaleString()} CRM-ready lead${imported.length === 1 ? "" : "s"}`}
        columns={[
          { key: "rowIndex", label: "#" },
          { key: "firstName", label: "First Name" },
          { key: "lastName", label: "Last Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "company", label: "Company" },
          { key: "jobTitle", label: "Job Title" },
          { key: "city", label: "City" },
          { key: "state", label: "State" },
          { key: "source", label: "Source" },
        ]}
        rows={imported}
        emptyMessage="No records were successfully parsed."
      />

      {skipped.length > 0 && (
        <ResultDataTable
          title="Skipped records"
          description={`${skipped.length.toLocaleString()} row${skipped.length === 1 ? "" : "s"} could not be imported`}
          columns={[
            { key: "rowIndex", label: "#" },
            { key: "reason", label: "Skip reason" },
            {
              key: "originalPreview",
              label: "Original data",
            },
          ]}
          rows={skipped.map((row) => ({
            ...row,
            originalPreview: Object.entries(row.original ?? {})
              .slice(0, 4)
              .map(([key, value]) => `${key}: ${value}`)
              .join(" · "),
          }))}
          emptyMessage="No records were skipped."
          variant="skipped"
        />
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>
          Import another file
        </Button>
      </div>
    </div>
  );
}
