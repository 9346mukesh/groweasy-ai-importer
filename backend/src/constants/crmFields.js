const CRM_FIELDS = [
  { key: "created_at", label: "Created At", description: "Lead creation date" },
  { key: "name", label: "Name", description: "Lead name" },
  { key: "email", label: "Email", description: "Primary email" },
  { key: "country_code", label: "Country Code", description: "Country code" },
  {
    key: "mobile_without_country_code",
    label: "Mobile",
    description: "Mobile number without country code",
  },
  { key: "company", label: "Company", description: "Company name" },
  { key: "city", label: "City", description: "City" },
  { key: "state", label: "State", description: "State" },
  { key: "country", label: "Country", description: "Country" },
  { key: "lead_owner", label: "Lead Owner", description: "Lead owner" },
  { key: "crm_status", label: "CRM Status", description: "Lead status" },
  { key: "crm_note", label: "CRM Note", description: "Notes or remarks" },
  { key: "data_source", label: "Data Source", description: "Source" },
  {
    key: "possession_time",
    label: "Possession Time",
    description: "Property possession time",
  },
  {
    key: "description",
    label: "Description",
    description: "Additional description",
  },
];

const CRM_FIELD_KEYS = CRM_FIELDS.map((field) => field.key);

function getCrmFieldSchemaForPrompt() {
  return CRM_FIELDS.map(
    (field) => `- ${field.key}: ${field.description}`
  ).join("\n");
}

function buildEmptyCrmRecord() {
  return CRM_FIELD_KEYS.reduce((record, key) => {
    record[key] = "";
    return record;
  }, {});
}

function toCrmRecord(lead) {
  const record = buildEmptyCrmRecord();

  for (const key of CRM_FIELD_KEYS) {
    if (lead?.[key] !== undefined && lead?.[key] !== null) {
      record[key] = String(lead[key]).trim();
    }
  }

  return record;
}

module.exports = {
  CRM_FIELDS,
  CRM_FIELD_KEYS,
  getCrmFieldSchemaForPrompt,
  buildEmptyCrmRecord,
  toCrmRecord,
};
