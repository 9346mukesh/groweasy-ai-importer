import Papa from "papaparse";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_FILE_TYPES = {
  "text/csv": [".csv"],
  "application/vnd.ms-excel": [".csv"],
  "text/plain": [".csv"],
};

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateCsvFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return {
      valid: false,
      error: "Please upload a CSV file with a .csv extension.",
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "The file is empty." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the ${formatFileSize(MAX_FILE_SIZE)} limit.`,
    };
  }

  return { valid: true };
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        const parseErrors = results.errors.filter(
          (error) => error.type !== "TooManyFields" && error.type !== "TooFewFields"
        );

        if (parseErrors.length > 0) {
          reject(
            new Error(
              parseErrors[0].message || "Invalid CSV format. Please check your file."
            )
          );
          return;
        }

        const headers = (results.meta.fields || []).filter(Boolean);

        if (headers.length === 0) {
          reject(new Error("CSV file has no column headers."));
          return;
        }

        const rows = results.data.filter((row) =>
          Object.values(row).some((value) => String(value ?? "").trim() !== "")
        );

        if (rows.length === 0) {
          reject(new Error("CSV file has headers but no data rows."));
          return;
        }

        resolve({
          fileName: file.name,
          fileSize: file.size,
          headers,
          rows,
          rowCount: rows.length,
          preview: rows.slice(0, 100),
        });
      },
      error: (error) => {
        reject(new Error(error.message || "Failed to parse CSV file."));
      },
    });
  });
}
