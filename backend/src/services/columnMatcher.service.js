const { CRM_FIELD_KEYS } = require("../constants/crmFields");

const COLUMN_ALIASES = {
  created_at: [
    "created at",
    "created_at",
    "created date",
    "creation date",
    "date created",
    "submitted at",
    "submission date",
    "timestamp",
    "date",
  ],
  name: [
    "name",
    "full name",
    "fullname",
    "full_name",
    "lead name",
    "contact name",
    "customer name",
  ],
  email: ["email", "e-mail", "email address", "email_address", "mail", "primary email"],
  country_code: [
    "country code",
    "country_code",
    "dial code",
    "phone country code",
    "isd code",
  ],
  mobile_without_country_code: [
    "phone",
    "mobile",
    "cell",
    "telephone",
    "phone number",
    "phone_number",
    "mobile number",
    "mobile_without_country_code",
    "contact number",
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
  city: ["city", "town", "locality"],
  state: ["state", "province", "region", "state/province"],
  country: ["country", "nation"],
  lead_owner: [
    "lead owner",
    "lead_owner",
    "owner",
    "assigned to",
    "assigned_to",
    "sales rep",
    "agent",
  ],
  crm_status: [
    "status",
    "crm status",
    "crm_status",
    "lead status",
    "lead_status",
  ],
  crm_note: [
    "note",
    "notes",
    "crm note",
    "crm_note",
    "comments",
    "comment",
    "remarks",
    "message",
  ],
  data_source: [
    "source",
    "data source",
    "data_source",
    "lead source",
    "lead_source",
    "campaign",
    "channel",
    "utm source",
  ],
  possession_time: [
    "possession time",
    "possession_time",
    "possession date",
    "move in date",
    "move-in date",
    "property possession",
  ],
  description: [
    "description",
    "details",
    "additional description",
    "about",
    "summary",
  ],
  firstName: ["first name", "firstname", "first_name", "fname", "given name"],
  lastName: ["last name", "lastname", "last_name", "lname", "surname", "family name"],
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
    const aliases = COLUMN_ALIASES[fieldKey] || [fieldKey.replace(/_/g, " ")];
    if (aliases.some((alias) => normalized === alias)) {
      return fieldKey;
    }
  }

  for (const fieldKey of CRM_FIELD_KEYS) {
    const aliases = COLUMN_ALIASES[fieldKey] || [fieldKey.replace(/_/g, " ")];
    if (
      aliases.some(
        (alias) => normalized.includes(alias) || alias.includes(normalized)
      )
    ) {
      return fieldKey;
    }
  }

  if (COLUMN_ALIASES.name.some((alias) => normalized.includes(alias))) {
    return "name";
  }

  if (
    COLUMN_ALIASES.firstName.some((alias) => normalized.includes(alias)) ||
    COLUMN_ALIASES.lastName.some((alias) => normalized.includes(alias))
  ) {
    return null;
  }

  return null;
}

function buildHeuristicMapping(headers) {
  const mapping = {};

  for (const header of headers) {
    const field = matchColumnToField(header);
    if (field && !mapping[field]) {
      mapping[field] = header;
    }
  }

  const firstNameHeader = headers.find((header) =>
    COLUMN_ALIASES.firstName.some((alias) => normalizeHeader(header).includes(alias))
  );
  const lastNameHeader = headers.find((header) =>
    COLUMN_ALIASES.lastName.some((alias) => normalizeHeader(header).includes(alias))
  );

  if (!mapping.name && (firstNameHeader || lastNameHeader)) {
    mapping._firstName = firstNameHeader || null;
    mapping._lastName = lastNameHeader || null;
  }

  return mapping;
}

module.exports = { buildHeuristicMapping, normalizeHeader, COLUMN_ALIASES };
