const { CRM_FIELD_KEYS, toCrmRecord } = require("../constants/crmFields");

function cleanValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeLead(rawLead, rowIndex) {
  const record = toCrmRecord(rawLead);
  return { rowIndex, ...record };
}

function getSkipReason(lead) {
  const hasEmail = Boolean(lead.email);
  const hasMobile = Boolean(lead.mobile_without_country_code);
  const hasName = Boolean(lead.name);

  if (!hasEmail && !hasMobile && !hasName) {
    return "Missing email, mobile, and name";
  }

  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    if (!hasMobile && !hasName) {
      return "Invalid email and no other contact info";
    }
  }

  return null;
}

function stripToCrmRecord(lead) {
  return toCrmRecord(lead);
}

module.exports = {
  cleanValue,
  normalizeLead,
  getSkipReason,
  stripToCrmRecord,
  CRM_FIELD_KEYS,
};
