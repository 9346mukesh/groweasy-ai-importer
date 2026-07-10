const CRM_FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Job Title" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip", label: "Zip" },
  { key: "country", label: "Country" },
  { key: "source", label: "Source" },
  { key: "notes", label: "Notes" },
];

const CRM_FIELD_KEYS = CRM_FIELDS.map((field) => field.key);

module.exports = { CRM_FIELDS, CRM_FIELD_KEYS };
