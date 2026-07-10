"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ACCEPTED_FILE_TYPES,
  formatFileSize,
  parseCsvFile,
  validateCsvFile,
} from "@/lib/csv";
import { cn } from "@/lib/utils";

export function CsvUpload({ fileData, onFileUploaded, onClear }) {
  const [isParsing, setIsParsing] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      const validation = validateCsvFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setIsParsing(true);

      try {
        const result = await parseCsvFile(file);
        onFileUploaded?.({ file, ...result });
        toast.success("CSV uploaded successfully");
      } catch (error) {
        toast.error(error.message || "Failed to parse CSV file.");
        onClear?.();
      } finally {
        setIsParsing(false);
      }
    },
    [onFileUploaded, onClear]
  );

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast.error("Please upload a valid CSV file (.csv only).");
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FILE_TYPES,
      maxFiles: 1,
      multiple: false,
      disabled: isParsing || Boolean(fileData),
      noClick: true,
      noKeyboard: true,
    });

  if (fileData) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" title={fileData.fileName}>
                {fileData.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(fileData.fileSize)} ·{" "}
                {fileData.rowCount.toLocaleString()} rows ·{" "}
                {fileData.headers.length} columns
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="shrink-0 self-start sm:self-center"
          >
            <X data-icon="inline-start" />
            Remove file
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV</CardTitle>
        <CardDescription>
          Drag and drop your file here, or browse to select one. Works with
          Facebook Lead Ads, Google Ads, Excel exports, CRM dumps, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={cn(
            "relative flex min-h-[220px] cursor-default flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            isDragActive && !isDragReject && "border-primary bg-primary/5",
            isDragReject && "border-destructive bg-destructive/5",
            !isDragActive && "border-border hover:border-primary/50 hover:bg-muted/30",
            isParsing && "pointer-events-none opacity-70"
          )}
        >
          <input {...getInputProps()} />

          <div
            className={cn(
              "mb-4 flex size-14 items-center justify-center rounded-full transition-colors",
              isDragActive && !isDragReject
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isParsing ? (
              <Loader2 className="size-7 animate-spin" />
            ) : isDragReject ? (
              <AlertCircle className="size-7 text-destructive" />
            ) : (
              <Upload className="size-7" />
            )}
          </div>

          {isParsing ? (
            <p className="text-sm font-medium">Parsing CSV file…</p>
          ) : isDragActive && !isDragReject ? (
            <p className="text-sm font-medium text-primary">Drop your CSV here</p>
          ) : isDragReject ? (
            <p className="text-sm font-medium text-destructive">
              Only .csv files are supported
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">
                Drag & drop your CSV file here
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or use the button below to browse
              </p>
            </>
          )}

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={open}
              disabled={isParsing}
              className="min-w-[160px]"
            >
              <FileSpreadsheet data-icon="inline-start" />
              Choose CSV file
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            CSV only · Max {formatFileSize(10 * 1024 * 1024)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
