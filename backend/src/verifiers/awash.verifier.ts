import puppeteer from "puppeteer";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

// ── Constants ──────────────────────────────────────────────────────────────────

const AWASH_BASE_URL = "https://awashpay.awashbank.com:8225";
const REFERENCE_REGEX = /\bFT[A-Z0-9]{6,12}\b/gi;
const PDF_REFERENCE_REGEX = /Transaction\s*Reference[:\s]+(FT[A-Z0-9]{8,})/i;
const PAGE_TIMEOUT_MS = 30_000;
const SELECTOR_TIMEOUT_MS = 20_000;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AwashVerifyResult {
  success: boolean;
  reference?: string;

  data?: Record<string, string>;

  resolved?: AwashResolvedFields;
  stampUrl?: string | null;
  error?: string;
}

export interface AwashResolvedFields {
  "Customer Name": string | null;
  "Account No": string | null;
  Recipient: string | null;
  Amount: string | null;
  "Txn Ref": string | null;
  "Trans type": string | null;
  Date: string | null;
}

const FIELD_VARIANTS: [keyof AwashResolvedFields, string[]][] = [
  [
    "Customer Name",
    [
      "customer name",
      "sender name",
      "sender",
      "payer",
      "payer name",
      "account name",
      "name",
      "client name",
      "debit name",
      "from",
    ],
  ],
  [
    "Account No",
    [
      "account no",
      "account number",
      "account #",
      "debit account",
      "debit account no",
      "source account",
      "from account",
      "payer account",
      "a/c no",
      "acc no",
    ],
  ],
  [
    "Recipient",
    [
      "recipient",
      "receiver",
      "receiver name",
      "beneficiary",
      "beneficiary name",
      "credit name",
      "to",
      "payee",
      "payee name",
      "credited to",
    ],
  ],
  [
    "Amount",
    [
      "amount",
      "amount (etb)",
      "transaction amount",
      "transfer amount",
      "paid amount",
      "debit amount",
      "etb amount",
      "birr",
      "value",
    ],
  ],
  [
    "Txn Ref",
    [
      "txn ref",
      "transaction reference",
      "transaction ref",
      "reference",
      "ref no",
      "ref number",
      "reference number",
      "ft ref",
      "receipt no",
      "receipt number",
    ],
  ],
  [
    "Trans type",
    [
      "trans type",
      "transaction type",
      "type",
      "payment type",
      "service",
      "service type",
      "transfer type",
      "narrative",
      "reason",
      "purpose",
      "payment purpose",
    ],
  ],
  [
    "Date",
    [
      "date",
      "transaction date",
      "txn date",
      "value date",
      "payment date",
      "processed date",
      "processed on",
      "date & time",
      "date/time",
      "datetime",
      "timestamp",
    ],
  ],
];

/**
 * Resolves raw scraped key→value pairs into the canonical AwashResolvedFields
 * shape by fuzzy-matching label names against known variants.
 */
function resolveFields(raw: Record<string, string>): AwashResolvedFields {
  // Normalize raw keys once for matching
  const normalizedRaw = Object.entries(raw).map(([k, v]) => ({
    normalizedKey: k.toLowerCase().trim(),
    value: v?.trim() || null,
  }));

  const resolved: AwashResolvedFields = {
    "Customer Name": null,
    "Account No": null,
    Recipient: null,
    Amount: null,
    "Txn Ref": null,
    "Trans type": null,
    Date: null,
  };

  for (const [canonical, variants] of FIELD_VARIANTS) {
    for (const { normalizedKey, value } of normalizedRaw) {
      if (variants.includes(normalizedKey) && value) {
        resolved[canonical] = value;
        break; // first match wins
      }
    }
  }

  // Last-resort: if Amount is still null, find any value that looks like a
  // decimal number (e.g. "1,500.00" or "1500.00") among all raw values
  if (!resolved["Amount"]) {
    for (const value of Object.values(raw)) {
      if (/^\d[\d,]*\.\d{2}$/.test(value?.trim() ?? "")) {
        resolved["Amount"] = value.trim();
        break;
      }
    }
  }

  return resolved;
}

// ── Text helpers ───────────────────────────────────────────────────────────────

/**
 * Cleans OCR output: collapses whitespace, fixes common digit/letter confusion.
 */
const cleanOCRText = (text: string): string =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(?<!\w)0(?!\w)/g, "O") // isolated 0 → O (avoids mangling amounts)
    .replace(/(?<!\w)1(?!\w)/g, "I"); // isolated 1 → I

// ── File type detection ────────────────────────────────────────────────────────

function detectFileType(buffer: Buffer): "pdf" | "image" {
  return buffer.slice(0, 4).toString() === "%PDF" ? "pdf" : "image";
}

// ── Reference extractors ───────────────────────────────────────────────────────

async function extractReferenceFromPdf(buffer: Buffer): Promise<string | null> {
  try {
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) })
      .promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(" ") + " ";
    }

    const match = fullText.match(PDF_REFERENCE_REGEX);
    return match ? match[1].toUpperCase() : null;
  } catch {
    return null;
  }
}

export async function extractReferenceFromImage(
  buffer: Buffer,
): Promise<string | null> {
  const processedBuffer = await sharp(buffer)
    .rotate()
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: 2000 })
    .toBuffer();

  const worker: any = await createWorker();
  try {
    const { data } = await worker.recognize(processedBuffer, "eng");
    const text = cleanOCRText(data.text);
    const matches = text.match(REFERENCE_REGEX);
    if (!matches || matches.length === 0) return null;
    // Last match is most likely the reference (avoids header noise)
    return matches[matches.length - 1].toUpperCase();
  } finally {
    await worker.terminate();
  }
}

// ── Main verifier ──────────────────────────────────────────────────────────────

export async function verifyAwash(payload: {
  reference?: string;
  fileBuffer?: Buffer;
}): Promise<AwashVerifyResult> {
  // ── 1. Resolve reference ───────────────────────────────────────────────────
  let reference = payload.reference?.trim().toUpperCase() ?? undefined;

  if (!reference && payload.fileBuffer) {
    const type = detectFileType(payload.fileBuffer);
    const extracted =
      type === "pdf"
        ? await extractReferenceFromPdf(payload.fileBuffer)
        : await extractReferenceFromImage(payload.fileBuffer);

    reference = extracted ?? undefined;
  }

  if (!reference) {
    return { success: false, error: "Transaction reference is required." };
  }

  // ── 2. Scrape the receipt page ─────────────────────────────────────────────
  let browser: any;
  try {
    const url = `${AWASH_BASE_URL}/${reference}`;

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Block fonts/images to speed up load; we only need DOM text
    await page.setRequestInterception(true);
    page.on("request", (req: any) => {
      const type = req.resourceType();
      if (type === "font" || type === "stylesheet") {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT_MS,
    });
    await page.waitForSelector("table, .error-message", {
      timeout: SELECTOR_TIMEOUT_MS,
    });

    const scraped = await page.evaluate(() => {
      const allFields: Record<string, string> = {};

      document.querySelectorAll("table").forEach((table) => {
        table.querySelectorAll("tr").forEach((row) => {
          const cells = Array.from(
            row.querySelectorAll("td, th"),
          ) as HTMLElement[];
          if (cells.length >= 2) {
            const label = cells[0]?.innerText?.trim() ?? "";
            // Always take the last cell as value (handles 3-col tables)
            const value = cells[cells.length - 1]?.innerText?.trim() ?? "";
            if (label) allFields[label] = value;
          }
        });
      });

      const stampImg = document.querySelector<HTMLImageElement>("img.stamp");

      return Object.keys(allFields).length > 0
        ? { fields: allFields, stampUrl: stampImg?.src ?? null }
        : null;
    });

    await browser.close();
    browser = undefined;

    if (!scraped) {
      return {
        success: false,
        error: "Failed to extract receipt data from page.",
      };
    }

    // ── 3. Resolve fields + attach to result ──────────────────────────────────
    const resolved = resolveFields(scraped.fields);

    return {
      success: true,
      reference,
      data: scraped.fields, // raw — for debugging / future fields
      resolved, // normalizer-ready canonical fields
      stampUrl: scraped.stampUrl,
    };
  } catch (err: any) {
    if (browser) await browser.close();
    return {
      success: false,
      error: err?.message ?? "Awash verification failed.",
    };
  }
}
