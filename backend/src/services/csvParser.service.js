const Papa = require("papaparse");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 10000;

function parseCsvContent(content, fileName) {
  if (!content || !String(content).trim()) {
    throw new Error("The file is empty.");
  }

  const results = Papa.parse(content, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => String(header ?? "").trim(),
  });

  const parseErrors = results.errors.filter(
    (error) => error.type !== "TooManyFields" && error.type !== "TooFewFields"
  );

  if (parseErrors.length > 0) {
    throw new Error(
      parseErrors[0].message || "Invalid CSV format. Please check your file."
    );
  }

  const headers = (results.meta.fields || []).filter(Boolean);

  if (headers.length === 0) {
    throw new Error("CSV file has no column headers.");
  }

  const rows = results.data.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").trim() !== "")
  );

  if (rows.length === 0) {
    throw new Error("CSV file has headers but no data rows.");
  }

  if (rows.length > MAX_ROWS) {
    throw new Error(`Import exceeds the ${MAX_ROWS.toLocaleString()} row limit.`);
  }

  return {
    fileName,
    headers,
    rows,
    rowCount: rows.length,
    columnCount: headers.length,
  };
}

function parseCsvBuffer(buffer, fileName) {
  if (!buffer || buffer.length === 0) {
    throw new Error("The file is empty.");
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("File size exceeds the 10MB limit.");
  }

  const content = buffer.toString("utf8");
  return parseCsvContent(content, fileName);
}

module.exports = {
  MAX_FILE_SIZE,
  MAX_ROWS,
  parseCsvBuffer,
  parseCsvContent,
};
