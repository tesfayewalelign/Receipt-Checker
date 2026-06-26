// Single source of truth for the public API documentation page.
// Values here are verified against the backend:
//   - backend/src/modules/verification/controllers/verify.controller.ts (request fields)
//   - backend/src/modules/api-keys/apiKey.middleware.ts (auth errors)
//   - backend/src/app.ts (route mounts)

import { API_URL } from "@/lib/config";

// Base URL shown in the docs and code samples. Comes from the shared config so
// that after deploy (with NEXT_PUBLIC_API_URL set) the docs and curl/JS samples
// show the real production host instead of a hard-coded localhost.
export const API_BASE_URL = API_URL;

export const VERIFY_PATH = "/api/public/receipt/verify";

export type ReceiptType =
  | "cbe"
  | "cbebirr"
  | "awash"
  | "dashen"
  | "mpesa"
  | "telebirr"
  | "abyssinia";

// Body parameters accepted by POST /api/public/receipt/verify.
export const REQUEST_PARAMS: Array<{
  name: string;
  type: string;
  required: string;
  description: string;
}> = [
  {
    name: "type",
    type: "string",
    required: "Required",
    description:
      "Provider to verify against. One of: cbe, cbebirr, awash, dashen, mpesa, telebirr, abyssinia.",
  },
  {
    name: "reference",
    type: "string",
    required: "Conditional",
    description:
      "Transaction reference / receipt number. Required unless you upload a file (the reference is then extracted automatically).",
  },
  {
    name: "accountSuffix",
    type: "string",
    required: "Conditional",
    description:
      "Last digits of the account number. Used by cbe and abyssinia.",
  },
  {
    name: "phoneNumber",
    type: "string",
    required: "Conditional",
    description: "Payer phone number (e.g. 09XXXXXXXX). Used by cbebirr.",
  },
  {
    name: "filePath",
    type: "string",
    required: "Optional",
    description: "Server-accessible path to a receipt file. Used by mpesa.",
  },
  {
    name: "file",
    type: "file",
    required: "Optional",
    description:
      "A receipt PDF or image sent as multipart/form-data. Alternative to reference — the backend extracts the reference via PDF parsing / OCR.",
  },
];

// Which fields each provider needs. Drives the "Banks & Fields" table.
export const BANK_FIELDS: Array<{
  type: ReceiptType;
  label: string;
  required: string;
}> = [
  {
    type: "cbe",
    label: "Commercial Bank of Ethiopia",
    required: "reference + accountSuffix (or file)",
  },
  {
    type: "cbebirr",
    label: "CBE Birr",
    required: "reference + phoneNumber (or file)",
  },
  { type: "awash", label: "Awash Bank", required: "reference (or file)" },
  { type: "dashen", label: "Dashen Bank", required: "reference (or file)" },
  { type: "telebirr", label: "Telebirr", required: "reference (or file)" },
  {
    type: "abyssinia",
    label: "Bank of Abyssinia",
    required: "reference + accountSuffix (or file)",
  },
  {
    type: "mpesa",
    label: "M-Pesa",
    required: "reference or filePath (or file)",
  },
];

// Fields returned inside `data` on a successful verification.
export const RESPONSE_FIELDS: Array<{
  name: string;
  type: string;
  description: string;
}> = [
  { name: "payer", type: "string | null", description: "Name of the sender." },
  {
    name: "payerAccount",
    type: "string | null",
    description: "Sender account number.",
  },
  {
    name: "receiver",
    type: "string | null",
    description: "Name of the recipient.",
  },
  {
    name: "receiverAccount",
    type: "string | null",
    description: "Recipient account number.",
  },
  { name: "amount", type: "number | null", description: "Transaction amount." },
  {
    name: "reference",
    type: "string | null",
    description: "Transaction reference number.",
  },
  {
    name: "reason",
    type: "string | null",
    description: "Payment reason / narrative.",
  },
  {
    name: "date",
    type: "string | null",
    description: "Transaction date/time.",
  },
];

// Error responses. Messages match the backend verbatim.
export const ERROR_ROWS: Array<{
  status: string;
  message: string;
  when: string;
}> = [
  {
    status: "400",
    message: "type is required",
    when: "The type field was omitted.",
  },
  {
    status: "400",
    message: "Unsupported receipt type",
    when: "type is not one of the supported providers.",
  },
  {
    status: "401",
    message: "API key is required",
    when: "The x-api-key header is missing.",
  },
  {
    status: "403",
    message: "Invalid API key",
    when: "The key does not exist.",
  },
  {
    status: "403",
    message: "API key is disabled",
    when: "The key has been revoked.",
  },
  {
    status: "500",
    message: "Verification failed",
    when: "The provider could not be reached or the receipt could not be parsed.",
  },
];

// ---- Code samples -------------------------------------------------------

export const CURL_SAMPLE = `curl -X POST ${API_BASE_URL}${VERIFY_PATH} \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "cbe",
    "reference": "DDF8VK998G",
    "accountSuffix": "1234"
  }'`;

export const JS_SAMPLE = `const res = await fetch("${API_BASE_URL}${VERIFY_PATH}", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "cbe",
    reference: "DDF8VK998G",
    accountSuffix: "1234",
  }),
});

const result = await res.json();
console.log(result);`;

export const JS_FILE_SAMPLE = `const form = new FormData();
form.append("type", "telebirr");
form.append("file", fileInput.files[0]); // PDF or image receipt

const res = await fetch("${API_BASE_URL}${VERIFY_PATH}", {
  method: "POST",
  headers: { "x-api-key": "YOUR_API_KEY" }, // no Content-Type — the browser sets it
  body: form,
});

const result = await res.json();
console.log(result);`;

export const SUCCESS_RESPONSE_SAMPLE = `{
  "success": true,
  "data": {
    "payer": "ABEBE KEBEDE",
    "payerAccount": "1000****1234",
    "receiver": "CHALA TOLA",
    "receiverAccount": "1000****5678",
    "amount": 1500,
    "reference": "DDF8VK998G",
    "reason": "Payment for order #1024",
    "date": "2026-06-15T09:24:00.000Z"
  }
}`;

export const ERROR_RESPONSE_SAMPLE = `{
  "success": false,
  "message": "Invalid API key"
}`;
