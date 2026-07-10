const { CRM_FIELD_KEYS } = require("../constants/crmFields");
const { getColumnMapping } = require("./aiMapping.service");

function cleanValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function splitFullName(fullName) {
  const parts = cleanValue(fullName).split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function extractLeadFromRow(row, mapping, rowIndex) {
  const lead = {};

  for (const field of CRM_FIELD_KEYS) {
    const sourceHeader = mapping[field];
    lead[field] = sourceHeader ? cleanValue(row[sourceHeader]) : "";
  }

  if (mapping.fullName) {
    const { firstName, lastName } = splitFullName(row[mapping.fullName]);

    if (!lead.firstName) {
      lead.firstName = firstName;
    }

    if (!lead.lastName) {
      lead.lastName = lastName;
    }
  }

  return {
    rowIndex: rowIndex + 1,
    ...lead,
  };
}

function getSkipReason(lead) {
  const hasEmail = Boolean(lead.email);
  const hasPhone = Boolean(lead.phone);
  const hasName = Boolean(lead.firstName || lead.lastName);

  if (!hasEmail && !hasPhone && !hasName) {
    return "Missing email, phone, and name";
  }

  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    if (!hasPhone && !hasName) {
      return "Invalid email and no other contact info";
    }
  }

  return null;
}

async function parseLeads(headers, rows) {
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

module.exports = { parseLeads };
