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
import { cn } from "@/lib/utils";

export const PREVIEW_ROW_LIMIT = 100;

function formatCellValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function CsvPreviewTable({
  headers,
  rows,
  rowCount,
  previewLimit = PREVIEW_ROW_LIMIT,
  className,
}) {
  const previewRows = rows.slice(0, previewLimit);
  const isTruncated = rowCount > previewLimit;

  return (
    <Card className={cn("overflow-hidden py-0", className)}>
      <CardHeader className="border-b bg-muted/30 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Data preview</CardTitle>
            <CardDescription className="mt-1">
              {isTruncated
                ? `Showing first ${previewLimit.toLocaleString()} of ${rowCount.toLocaleString()} rows`
                : `${rowCount.toLocaleString()} row${rowCount === 1 ? "" : "s"} · ${headers.length} column${headers.length === 1 ? "" : "s"}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Scroll</span>
            <span className="rounded-md border bg-background px-2 py-1 font-medium">
              ↔ Horizontal
            </span>
            <span className="rounded-md border bg-background px-2 py-1 font-medium">
              ↕ Vertical
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          className="max-h-[min(60vh,560px)] overflow-auto"
          role="region"
          aria-label="CSV data preview table"
          tabIndex={0}
        >
          <table className="w-full min-w-max caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-20 bg-muted/95 backdrop-blur-sm shadow-[0_1px_0_0_var(--border)]">
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableHead className="sticky left-0 z-30 min-w-[3rem] border-r bg-muted/95 px-3 text-center font-semibold backdrop-blur-sm">
                  #
                </TableHead>
                {headers.map((header) => (
                  <TableHead
                    key={header}
                    className="min-w-[140px] max-w-[280px] px-3 font-semibold"
                    title={header}
                  >
                    <span className="block truncate">{header}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {previewRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="group">
                  <TableCell className="sticky left-0 z-10 border-r bg-background px-3 text-center text-xs font-medium text-muted-foreground group-hover:bg-muted/50">
                    {rowIndex + 1}
                  </TableCell>
                  {headers.map((header) => {
                    const value = formatCellValue(row[header]);

                    return (
                      <TableCell
                        key={`${rowIndex}-${header}`}
                        className="max-w-[280px] px-3"
                        title={value}
                      >
                        <span className="block truncate">{value || "—"}</span>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>

        {isTruncated && (
          <div className="border-t bg-muted/20 px-4 py-3 text-center text-xs text-muted-foreground sm:text-sm">
            Preview limited to {previewLimit.toLocaleString()} rows. All{" "}
            {rowCount.toLocaleString()} rows will be available for import.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
