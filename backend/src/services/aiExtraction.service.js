const {
  buildEmptyCrmRecord,
  getCrmFieldSchemaForPrompt,
} = require("../constants/crmFields");

const {
  getGroqClient,
  getGroqModel,
  isGroqConfigured,
} = require("../config/groq");

const {
  getSkipReason,
  normalizeLead,
} = require("../utils/leadValidation");

const progressService = require(
  "./importProgress.service"
);

const DEFAULT_BATCH_SIZE = 15;
const MAX_RETRIES = 2;
const BATCH_DELAY_MS = 500;

function getBatchSize() {
  const configured = Number(process.env.GROQ_BATCH_SIZE);

  return Number.isFinite(configured) && configured > 0
    ? Math.min(configured, 50)
    : DEFAULT_BATCH_SIZE;
}

function chunkRows(rows) {
  const batchSize = getBatchSize();
  const chunks = [];

  for (let index = 0; index < rows.length; index += batchSize) {
    chunks.push(
      rows.slice(index, index + batchSize).map((row, offset) => ({
        rowIndex: index + offset + 1,
        data: row,
      }))
    );
  }

  return chunks;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJsonResponse(text) {
  const cleaned = String(text ?? "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

function buildExtractionPrompt(headers, batch) {
  const emptyRecord = buildEmptyCrmRecord();

return `
You are an expert CRM Lead Extraction AI specializing in importing messy CSV files into the GrowEasy CRM.

Your task is to convert EVERY CSV row into the most accurate GrowEasy CRM record.

The uploaded CSV may come from:

- Facebook Lead Ads

- Google Ads

- Meta Ads

- Excel Sheets

- Real Estate CRM exports

- Sales CRM exports

- Marketing agencies

- Broker databases

- Manually created spreadsheets

- Any other unknown CRM

Column names are NOT fixed.

Columns may have:

- Different names

- Duplicate meanings

- Missing values

- Extra values

- Different layouts

- Abbreviations

- Synonyms

Infer the correct CRM fields using BOTH:

1. Column headers

2. Actual values inside the rows

Accuracy is more important than filling every field.

If uncertain,

leave the field empty instead of guessing.
--------
GrowEasy CRM Fields
----
${getCrmFieldSchemaForPrompt()}

==================================================

Field Extraction Guidelines

==================================================

created_at

• Extract the lead creation date.

• Accept common date formats.

• Convert into YYYY-MM-DD.

• If conversion is impossible return "".

--------------------------------------------------

name

• Extract the customer's full name.

• Ignore titles like:

  Mr.

  Mrs.

  Ms.

  Dr.

unless they are actually part of the name.

--------------------------------------------------

email

• Extract the primary email.

• If multiple emails exist:

  - use the FIRST email

  - append remaining emails into crm_note

--------------------------------------------------

country_code

Extract ONLY the country dialing code.

Examples

+91

+1

+44

--------------------------------------------------

mobile_without_country_code

Extract ONLY the mobile number.

Remove:

spaces

hyphens

brackets

dots

Do NOT include country code.

If multiple mobile numbers exist:

Use the FIRST mobile number.

Append remaining mobile numbers into crm_note.

--------------------------------------------------

company

Extract the organization or company.

--------------------------------------------------

city

Extract only the city.

--------------------------------------------------

state

Extract only the state.

--------------------------------------------------

country

Extract only the country.

--------------------------------------------------

lead_owner

Extract the assigned sales representative if available.

--------------------------------------------------

crm_status

Return ONLY one of:
GOOD_LEAD_FOLLOW_UP

DID_NOT_CONNECT

BAD_LEAD

SALE_DONE

--------------------------------------------------

crm_note

Store:

• follow-up remarks

• additional comments

• remaining phone numbers

• remaining email addresses

• useful observations

--------------------------------------------------


data_source

Return ONLY one of:

leads_on_demand

meridian_tower

eden_park

varah_swamy

sarjapur_plots

--------------------------------------------------

possession_time

Extract property possession timeline.

--------------------------------------------------

description

Store every useful piece of information that cannot fit another CRM field.

Never discard useful information.

RULES

==================================================

1.

Return ONLY valid JSON.

--------------------------------------------------

2.

Never return:

Markdown

Code blocks

Comments

Explanations

Apologies

Notes

The FIRST character must be {

The LAST character must be }

--------------------------------------------------

3.

Process EVERY input row.

--------------------------------------------------

4.

Preserve rowIndex.

--------------------------------------------------

5.

Number of output records MUST equal input rows.

If input has 25 rows

output MUST contain exactly 25 records.

--------------------------------------------------

6.

Every row must return

status = "imported"

OR

status = "skipped"

Never omit a row.

--------------------------------------------------

7.

Never fabricate information.

Only extract values that exist.

Never invent:

Names

Emails

Phone numbers

Cities

States

Countries

Companies

Lead owners

Dates

Statuses

--------------------------------------------------

8.

Infer field meaning using BOTH:

Column headers

Sample values

Do NOT rely only on column names.

--------------------------------------------------

9.

Normalize extracted values.

Trim whitespace.

Remove duplicate spaces.

Keep original capitalization of names.

Keep company names unchanged.

--------------------------------------------------

10.

Date Handling

Accept formats like:

2026-05-13

2026-05-13 14:20:48

13/05/2026

13-May-2026

May 13 2026

Convert ALL dates into

YYYY-MM-DD

If impossible

return ""

--------------------------------------------------

11.

Phone Numbers

Examples

+91 9876543210

Return

country_code="+91"

mobile_without_country_code="9876543210"

If no country code exists

country_code=""

--------------------------------------------------

12.

Phone Validation

After removing

spaces

hyphens

brackets

dots

the mobile number should contain digits only.

If invalid

mobile_without_country_code=""

Append original value into crm_note.

Example

90000AB123

↓

crm_note

Invalid phone: 90000AB123

--------------------------------------------------

13.

Multiple Phone Numbers

Use FIRST phone.

Store remaining phones inside crm_note.

Never discard them.

--------------------------------------------------

14.

Email Validation

A valid email must contain

@

and a valid domain.

If invalid

email=""

Append original value into crm_note.

Example

customer31@example

↓

email=""

crm_note

Invalid email: customer31@example

--------------------------------------------------

15.

Multiple Emails

Use FIRST email.

Append remaining emails into crm_note.

Never discard them.

--------------------------------------------------

16.

CRM Status

Allowed values ONLY

GOOD_LEAD_FOLLOW_UP

DID_NOT_CONNECT

BAD_LEAD

SALE_DONE

Normalize

Interested

Follow Up

Call Later

Meeting Scheduled

Demo Scheduled

Interested Again

Recontact

↓

GOOD_LEAD_FOLLOW_UP

Busy

No Answer

Didn't Pick

Not Reachable

Switched Off

Voicemail

↓

DID_NOT_CONNECT

Rejected

Wrong Number

Duplicate

Fake Lead

Spam

Lost

Invalid Lead

↓

BAD_LEAD

Won

Closed Won

Converted

Booked

Agreement Signed

Purchased

Payment Done

Sale Complete

↓

SALE_DONE

Never invent new status values.

--------------------------------------------------

17.

Data Source

Allowed values ONLY

leads_on_demand

meridian_tower

eden_park

varah_swamy

sarjapur_plots

Normalize

Lead On Demand

LeadOnDemand

↓

leads_on_demand

Meridian

↓

meridian_tower

Sarjapur

↓

sarjapur_plots

Eden

↓

eden_park

Varah

↓

varah_swamy

Otherwise

return ""

--------------------------------------------------

18.

Location Normalization

Cities

BLR

Bangalore

↓

Bengaluru

Bombay

↓

Mumbai

Hyd

↓

Hyderabad

States

KA

↓

Karnataka

MH

↓

Maharashtra

TS

↓

Telangana

TN

↓

Tamil Nadu

DL

↓

Delhi

Countries

IND

IN

↓

India

--------------------------------------------------

19.

Duplicate Information

If multiple columns contain the same information

Use the most complete value.

Store remaining values inside crm_note.

--------------------------------------------------

20.

CRM Notes

Store

Remaining phones

Remaining emails

Comments

Follow-up remarks

Extra observations

Invalid email values

Invalid phone values

--------------------------------------------------

21.

Description

Never discard useful information.

Store

Budget

Project

Campaign

Property Type

Lead Score

Alternate Address

Customer Requirements

Source Remarks

Sales Comments

or any other unmapped information.

--------------------------------------------------

22.

CSV Safety

Never include raw line breaks.

Replace every line break with "\\n"

--------------------------------------------------

23.

Confidence Rule

Only map a value if reasonably confident.

If confidence is low

leave the field empty.

Never guess.

--------------------------------------------------

24.

Skip Rule

Skip ONLY when BOTH

email

AND

mobile number

are missing.

Missing name alone should NOT cause skipping.

--------------------------------------------------

25.

Missing CRM fields

must contain

empty strings.

--------------------------------------------------

26.

Never duplicate the same value into multiple CRM fields unless explicitly required.


==================================================

CSV Headers

==================================================

${JSON.stringify(headers)}

==================================================

CSV Records

==================================================

${JSON.stringify(batch, null, 2)}

==================================================

Return EXACTLY this JSON

==================================================

{

  "records":[
    {

      "rowIndex":1,

      "status":"imported",

      "lead":${JSON.stringify(emptyRecord)}

    },

    {

      "rowIndex":2,

      "status":"skipped",

      "reason":"Missing both email and mobile number"

    }

  ]

}

`;

}

async function callExtractionModel(client, headers, batch) {
  const prompt = buildExtractionPrompt(headers, batch);

  const response = await client.chat.completions.create({
    model: getGroqModel(),
    temperature: 0,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
}

async function extractBatchWithRetry(client, headers, batch) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const content = await callExtractionModel(
        client,
        headers,
        batch
      );

      const parsed = parseJsonResponse(content);

      return Array.isArray(parsed.records)
        ? parsed.records
        : [];
    } catch (error) {
      lastError = error;

      console.error(
        `Groq extraction attempt ${attempt} failed`
      );

      console.error(error.message);

      if (attempt < MAX_RETRIES) {
        await sleep(BATCH_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}

function cleanReason(reason) {
  return String(reason ?? "").trim();
}

function mergeBatchResults(
  records,
  batch,
  imported,
  skipped
) {
  const rowMap = new Map(
    batch.map((item) => [item.rowIndex, item.data])
  );

  const processed = new Set();

  for (const record of records) {
    const rowIndex = Number(record.rowIndex);

    const original = rowMap.get(rowIndex);

    if (!original) {
      continue;
    }

    processed.add(rowIndex);

    if (record.status === "skipped") {
      skipped.push({
        rowIndex,
        reason:
          cleanReason(record.reason) ||
          "Skipped by Groq",
        original,
      });

      continue;
    }

    const lead = normalizeLead(
      record.lead || {},
      rowIndex
    );

    const skipReason = getSkipReason(lead);

    if (skipReason) {
      skipped.push({
        rowIndex,
        reason: skipReason,
        original,
      });

      continue;
    }

    imported.push(lead);
  }

  for (const item of batch) {
    if (processed.has(item.rowIndex)) {
      continue;
    }

    skipped.push({
      rowIndex: item.rowIndex,
      reason: "Groq did not return a result",
      original: item.data,
    });
  }
}
async function extractLeadsWithAi(headers, rows) {
  if (!isGroqConfigured()) {
    return null;
  }

  const client = getGroqClient();

  if (!client) {
    return null;
  }

  const batches = chunkRows(rows);

  // Start tracking progress
  progressService.start(batches.length);

  const imported = [];
  const skipped = [];

  for (let index = 0; index < batches.length; index++) {
    const batch = batches[index];

    const records = await extractBatchWithRetry(
      client,
      headers,
      batch
    );

    mergeBatchResults(
      records,
      batch,
      imported,
      skipped
    );

    // Update progress
    progressService.update(index + 1);

    if (index < batches.length - 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  imported.sort((a, b) => a.rowIndex - b.rowIndex);
  skipped.sort((a, b) => a.rowIndex - b.rowIndex);

  // Finish progress
  progressService.finish();

  return {
    mappingMethod: "ai-batch",
    model: getGroqModel(),
    batchSize: getBatchSize(),
    batchCount: batches.length,
    imported,
    skipped,
    totalImported: imported.length,
    totalSkipped: skipped.length,
  };
}

module.exports = {
  extractLeadsWithAi,
  getBatchSize,
  chunkRows,
};