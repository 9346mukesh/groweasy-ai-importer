"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

import { ConfirmImport } from "@/components/confirm-import/ConfirmImport";
import { CsvPreviewTable } from "@/components/csv-preview/CsvPreviewTable";
import { CsvUpload } from "@/components/csv-upload/CsvUpload";
import { ParsedResultView } from "@/components/parsed-result/ParsedResultView";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: 1, label: "Upload CSV" },
  { id: 2, label: "Preview" },
  { id: 3, label: "Confirm Import" },
  { id: 4, label: "Results" },
];

function StepIndicator({ currentStep }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-0">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isComplete = step.id < currentStep;

        return (
          <li key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id}
              </span>
              <span
                className={`hidden text-sm sm:inline ${
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 hidden h-px w-6 sm:mx-3 sm:block sm:w-10 ${
                  isComplete ? "bg-emerald-300 dark:bg-emerald-800" : "bg-border"
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ImporterApp() {
  const [csvData, setCsvData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [step, setStep] = useState(1);

  const handleFileUploaded = (data) => {
    setCsvData(data);
    setImportResult(null);
    setStep(2);
  };

  const handleClear = () => {
    setCsvData(null);
    setImportResult(null);
    setStep(1);
  };

  const handleImportComplete = (response) => {
    setImportResult(response);
    setStep(4);
  };

  const heading = {
    1: {
      title: "Upload your lead CSV",
      description:
        "Upload a CSV from any source — we'll intelligently map columns to GrowEasy CRM fields.",
    },
    2: {
      title: "Preview your data",
      description:
        "Review the parsed rows below. Nothing is sent to the server until you confirm.",
    },
    3: {
      title: "Confirm import",
      description:
        "Review the summary and click Confirm Import to send your data to the server.",
    },
    4: {
      title: "Parsed results",
      description:
        "AI-extracted CRM records are shown below, including any rows that were skipped.",
    },
  }[step];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none sm:text-lg">
                GrowEasy AI Importer
              </h1>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Import leads from any CSV into GrowEasy CRM
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <StepIndicator currentStep={step} />
        </div>

        <div
          className={`mx-auto space-y-6 ${step >= 2 ? "max-w-full" : "max-w-2xl"}`}
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {heading.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {heading.description}
            </p>
          </div>

          {step === 1 && (
            <CsvUpload
              fileData={null}
              onFileUploaded={handleFileUploaded}
              onClear={handleClear}
            />
          )}

          {step >= 2 && step <= 3 && csvData && (
            <CsvUpload
              fileData={csvData}
              onFileUploaded={handleFileUploaded}
              onClear={handleClear}
            />
          )}

          {step === 2 && csvData && (
            <>
              <CsvPreviewTable
                headers={csvData.headers}
                rows={csvData.rows}
                rowCount={csvData.rowCount}
              />
              <div className="flex justify-end">
                <Button onClick={() => setStep(3)} className="min-w-[200px]">
                  Continue to confirm
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </>
          )}

          {step === 3 && csvData && (
            <ConfirmImport
              key={csvData.fileName}
              csvData={csvData}
              onImportComplete={handleImportComplete}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && importResult && (
            <ParsedResultView result={importResult} onReset={handleClear} />
          )}

          {step === 1 && (
            <div className="rounded-xl border bg-muted/30 p-4 sm:p-5">
              <p className="text-sm font-medium">Supported sources</p>
              <ul className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                <li>Facebook Lead Export</li>
                <li>Google Ads Export</li>
                <li>Excel / Google Sheets</li>
                <li>Real Estate CRM exports</li>
                <li>Sales & marketing reports</li>
                <li>Custom spreadsheets</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
