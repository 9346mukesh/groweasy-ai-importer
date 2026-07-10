const { parseLeads } = require("../services/leadParser.service");
const { parseCsvBuffer } = require("../services/csvParser.service");

function validateImportPayload(body) {
  const { fileName, headers, rows } = body ?? {};

  if (!fileName || typeof fileName !== "string") {
    return "fileName is required.";
  }

  if (!Array.isArray(headers) || headers.length === 0) {
    return "headers must be a non-empty array.";
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return "rows must be a non-empty array.";
  }

  if (rows.length > 10000) {
    return "Import exceeds the 10,000 row limit.";
  }

  return null;
}

function resolveImportInput(req) {
  if (req.file) {
    return parseCsvBuffer(req.file.buffer, req.file.originalname);
  }

  const validationError = validateImportPayload(req.body);

  if (validationError) {
    const message = req.is("multipart/form-data")
      ? "CSV file is required. Upload using the 'file' field."
      : validationError;
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return {
    fileName: req.body.fileName,
    headers: req.body.headers,
    rows: req.body.rows,
    rowCount: req.body.rows.length,
    columnCount: req.body.headers.length,
  };
}

async function uploadCsv(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "CSV file is required. Use multipart/form-data with a 'file' field.",
    });
  }

  try {
    const parsed = parseCsvBuffer(req.file.buffer, req.file.originalname);

    return res.status(200).json({
      success: true,
      message: "CSV parsed successfully.",
      data: {
        fileName: parsed.fileName,
        fileSize: req.file.size,
        headers: parsed.headers,
        rows: parsed.rows,
        rowCount: parsed.rowCount,
        columnCount: parsed.columnCount,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to parse CSV file.",
    });
  }
}

async function importCsv(req, res) {
  try {
    const { fileName, headers, rows, rowCount } = resolveImportInput(req);
    const result = await parseLeads(headers, rows);

    return res.status(200).json({
      success: true,
      message: `Parsed ${result.totalImported} record${result.totalImported === 1 ? "" : "s"} successfully.`,
      data: {
        fileName,
        totalRows: rowCount,
        totalImported: result.totalImported,
        totalSkipped: result.totalSkipped,
        mappingMethod: result.mappingMethod,
        headers,
        imported: result.imported,
        skipped: result.skipped,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
      console.error("Import processing failed:", error);
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to process import.",
    });
  }
}

module.exports = { uploadCsv, importCsv };
