const { CRM_FIELD_KEYS } = require("../constants/crmFields");

const COLUMN_ALIASES = {
  firstName: [
    "first name",
    "firstname",
    "first_name",
    "fname",
    "given name",
    "givenname",
  ],
  lastName: [
    "last name",
    "lastname",
    "last_name",
    "lname",
    "surname",
    "family name",
    "familyname",
  ],
  email: ["email", "e-mail", "email address", "email_address", "mail"],
  phone: [
    "phone",
    "telephone",
    "mobile",
    "cell",
    "phone number",
    "phone_number",
    "contact number",
    "work phone",
    "home phone",
  ],
  company: [
    "company",
    "company name",
    "company_name",
    "organization",
    "organisation",
    "business",
    "employer",
  ],
  jobTitle: [
    "job title",
    "job_title",
    "title",
    "position",
    "role",
    "designation",
  ],
  address: [
    "address",
    "street",
    "street address",
    "street_address",
    "address line 1",
    "address1",
  ],
  city: ["city", "town", "locality"],
  state: ["state", "province", "region", "state/province"],
  zip: ["zip", "zip code", "zipcode", "zip_code", "postal code", "postcode"],
  country: ["country", "nation"],
  source: [
    "source",
    "lead source",
    "lead_source",
    "campaign",
    "utm source",
    "channel",
  ],
  notes: ["notes", "note", "comments", "comment", "description", "message"],
  fullName: ["full name", "fullname", "full_name", "name", "contact name"],
};

function normalizeHeader(header) {
  return String(header ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function matchColumnToField(header) {
  const normalized = normalizeHeader(header);

  for (const fieldKey of CRM_FIELD_KEYS) {
    const aliases = COLUMN_ALIASES[fieldKey] || [fieldKey];
    if (aliases.some((alias) => normalized === alias)) {
      return fieldKey;
    }
  }

  for (const fieldKey of CRM_FIELD_KEYS) {
    const aliases = COLUMN_ALIASES[fieldKey] || [fieldKey];
    if (
      aliases.some(
        (alias) => normalized.includes(alias) || alias.includes(normalized)
      )
    ) {
      return fieldKey;
    }
  }

  if (COLUMN_ALIASES.fullName.some((alias) => normalized.includes(alias))) {
    return "fullName";
  }

  return null;
}

function buildHeuristicMapping(headers) {
  const mapping = {};
  const usedHeaders = new Set();

  for (const header of headers) {
    const field = matchColumnToField(header);
    if (field && field !== "fullName" && !mapping[field]) {
      mapping[field] = header;
      usedHeaders.add(header);
    }
  }

  if (!mapping.firstName && !mapping.lastName) {
    const fullNameHeader = headers.find(
      (header) => matchColumnToField(header) === "fullName"
    );

    if (fullNameHeader) {
      mapping.fullName = fullNameHeader;
    }
  }

  return mapping;
}

module.exports = { buildHeuristicMapping, normalizeHeader };
