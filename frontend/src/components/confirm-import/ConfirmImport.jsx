"use client";

import { useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { confirmImport } from "@/lib/api";

export function ConfirmImport({ csvData, onImportComplete, onBack }) {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await confirmImport({
        file: csvData.file,
        fileName: csvData.fileName,
        headers: csvData.headers,
        rows: csvData.rows,
      });

      onImportComplete?.(response);
      toast.success("Import processed successfully");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to confirm import. Please try again.";

      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Confirm import</CardTitle>
        <CardDescription>
          Review the summary below. Your data will only be sent to the server
          when you click Confirm Import.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              File
            </p>
            <p
              className="mt-1 truncate text-sm font-medium"
              title={csvData.fileName}
            >
              {csvData.fileName}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Rows to import
            </p>
            <p className="mt-1 text-sm font-medium">
              {csvData.rowCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Columns
            </p>
            <p className="mt-1 text-sm font-medium">
              {csvData.headers.length}
            </p>
          </div>
        </div>

        {status === "error" && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Import failed</p>
              <p className="mt-1 text-destructive/90">{errorMessage}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 sm:flex-row sm:justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={status === "loading"}
          className="w-full sm:w-auto"
        >
          <ArrowLeft data-icon="inline-start" />
          Back to preview
        </Button>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {status === "error" && (
            <Button variant="outline" onClick={handleRetry} className="w-full sm:w-auto">
              Try again
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={status === "loading"}
            className="w-full sm:min-w-[180px]"
          >
            {status === "loading" ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Processing with AI…
              </>
            ) : (
              <>
                <Send data-icon="inline-start" />
                Confirm Import
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
