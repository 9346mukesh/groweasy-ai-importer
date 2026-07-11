const {
  CRM_FIELD_KEYS,
  getCrmFieldSchemaForPrompt,
} = require("../constants/crmFields");

const {
  getGroqClient,
  getGroqModel,
  isGroqConfigured,
} = require("../config/groq");

const { buildHeuristicMapping } = require("./columnMatcher.service");

function buildMappingPrompt(headers, sampleRows) {
  return `
You are an expert CRM field mapping assistant.

Your task is to map arbitrary CSV columns into GrowEasy CRM fields.

CSV column names are NOT fixed.
Infer the meaning of each column using BOTH the header and sample values.

GrowEasy CRM Fields

${getCrmFieldSchemaForPrompt()}

Rules

Rules

1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Use the EXACT CSV header names.
4. Never invent a CSV header.
5. If no matching column exists, return null.
6. Infer mappings using BOTH:
  - Column names
  - Sample values
7. Prefer semantic meaning over exact wording.
8. Only map a column when confidence is high.
9. If confidence is low, return null.
10. Never guess mappings.
11. Each CSV column should map to at most one CRM field whenever possible.

CSV Headers

${JSON.stringify(headers)}

Sample Rows

${JSON.stringify(sampleRows.slice(0, 3), null, 2)}

Return EXACTLY:

{
  "mapping": {
${CRM_FIELD_KEYS.map((field) => `    "${field}": null`).join(",\n")}
  }
}
`;
}

function sanitizeMapping(mapping, headers) {
  const headerSet = new Set(headers);
  const sanitized = {};

  for (const field of CRM_FIELD_KEYS) {
    const value = mapping?.[field];

    sanitized[field] =
      typeof value === "string" && headerSet.has(value)
        ? value
        : null;
  }

  return sanitized;
}

function parseJson(text) {
  const cleaned = String(text ?? "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

async function getColumnMapping(headers, sampleRows) {
  if (!isGroqConfigured()) {
    return {
      mapping: buildHeuristicMapping(headers),
      method: "heuristic",
    };
  }

  try {
    const client = getGroqClient();

    const response = await client.chat.completions.create({
      model: getGroqModel(),
      temperature: 0,
      messages: [
        {
          role: "user",
          content: buildMappingPrompt(headers, sampleRows),
        },
      ],
    });

    const parsed = parseJson(
      response.choices[0].message.content
    );

    const mapping = sanitizeMapping(
      parsed.mapping,
      headers
    );

    const hasMappedField = Object.values(mapping).some(Boolean);

    if (!hasMappedField) {
      return {
        mapping: buildHeuristicMapping(headers),
        method: "heuristic-fallback",
      };
    }

    return {
      mapping,
      method: "groq-column-map",
    };
  } catch (error) {
    console.error(
      "Groq column mapping failed. Falling back to heuristic."
    );

    console.error(error.message);

    return {
      mapping: buildHeuristicMapping(headers),
      method: "heuristic-fallback",
    };
  }
}

module.exports = {
  getColumnMapping,
};