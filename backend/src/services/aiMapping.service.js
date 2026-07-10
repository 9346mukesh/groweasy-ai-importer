const OpenAI = require("openai");
const { CRM_FIELD_KEYS } = require("../constants/crmFields");
const { buildHeuristicMapping } = require("./columnMatcher.service");

function getOpenAIClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "your_openrouter_api_key") {
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });
}

function buildMappingPrompt(headers, sampleRows) {
  return `You are a CRM data mapping assistant for GrowEasy CRM.

Given CSV column headers and sample rows, map each GrowEasy CRM field to the best matching CSV column header.

CRM fields: ${CRM_FIELD_KEYS.join(", ")}

Rules:
- Return ONLY valid JSON, no markdown.
- Use exact CSV header strings as values.
- Use null when no suitable column exists.
- Map "full name" style columns to firstName only if you can infer split; otherwise map to firstName with the full value and leave lastName null.
- Prefer the most specific column for each field.

CSV headers:
${JSON.stringify(headers)}

Sample rows:
${JSON.stringify(sampleRows.slice(0, 3), null, 2)}

Respond with this JSON shape:
{
  "mapping": {
    "firstName": "exact header or null",
    "lastName": "exact header or null",
    "email": "exact header or null",
    "phone": "exact header or null",
    "company": "exact header or null",
    "jobTitle": "exact header or null",
    "address": "exact header or null",
    "city": "exact header or null",
    "state": "exact header or null",
    "zip": "exact header or null",
    "country": "exact header or null",
    "source": "exact header or null",
    "notes": "exact header or null"
  }
}`;
}

function sanitizeMapping(mapping, headers) {
  const headerSet = new Set(headers);
  const sanitized = {};

  for (const field of CRM_FIELD_KEYS) {
    const value = mapping?.[field];
    sanitized[field] =
      typeof value === "string" && headerSet.has(value) ? value : null;
  }

  return sanitized;
}

async function getColumnMapping(headers, sampleRows) {
  const client = getOpenAIClient();

  if (!client) {
    return {
      mapping: buildHeuristicMapping(headers),
      method: "heuristic",
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You map CSV columns to CRM fields. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: buildMappingPrompt(headers, sampleRows),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    const mapping = sanitizeMapping(parsed.mapping, headers);

    const hasMappedField = Object.values(mapping).some(Boolean);
    if (!hasMappedField) {
      return {
        mapping: buildHeuristicMapping(headers),
        method: "heuristic-fallback",
      };
    }

    return { mapping, method: "ai" };
  } catch (error) {
    console.error("AI mapping failed, using heuristic fallback:", error.message);
    return {
      mapping: buildHeuristicMapping(headers),
      method: "heuristic-fallback",
    };
  }
}

module.exports = { getColumnMapping };
