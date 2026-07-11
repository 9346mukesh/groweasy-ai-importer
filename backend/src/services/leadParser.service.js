const { CRM_FIELD_KEYS } = require("../constants/crmFields");
const { extractLeadsWithAi } = require("./aiExtraction.service");
const { getColumnMapping } = require("./aiMapping.service");
const {
  cleanValue,
  getSkipReason,
  normalizeLead,
} = require("../utils/leadValidation");

function buildNameFromParts(firstName, lastName) {
  return [cleanValue(firstName), cleanValue(lastName)].filter(Boolean).join(" ");
}

function extractLeadFromRow(row, mapping, rowIndex) {
  const lead = { rowIndex: rowIndex + 1 };

  for (const field of CRM_FIELD_KEYS) {
    const sourceHeader = mapping[field];
    lead[field] = sourceHeader ? cleanValue(row[sourceHeader]) : "";
  }

  if (!lead.name) {
    lead.name = buildNameFromParts(
      mapping._firstName ? row[mapping._firstName] : "",
      mapping._lastName ? row[mapping._lastName] : ""
    );
  }

  return normalizeLead(lead, lead.rowIndex);
}

async function parseLeadsHeuristic(headers, rows) {
  const { mapping, method } = await getColumnMapping(headers, rows);
  const imported = [];
  const skipped = [];

  rows.forEach((row, index) => {
    const lead = extractLeadFromRow(row, mapping, index);
    const skipReason = getSkipReason(lead);

    if (skipReason) {
      skipped.push({
        rowIndex: lead.rowIndex,
        reason: skipReason,
        original: row,
      });
      return;
    }

    imported.push(lead);
  });

  return {
    mapping,
    mappingMethod: method,
    imported,
    skipped,
    totalImported: imported.length,
    totalSkipped: skipped.length,
  };
}

async function parseLeads(headers, rows) {
  try {
    const aiResult = await extractLeadsWithAi(headers, rows);

    if (aiResult) {
      return aiResult;
    }
  } catch (error) {
    console.error("AI batch extraction failed, falling back to heuristic:", error.message);
  }

  return parseLeadsHeuristic(headers, rows);
}

module.exports = { parseLeads, parseLeadsHeuristic };
