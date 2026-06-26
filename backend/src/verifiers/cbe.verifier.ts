import puppeteer, { Browser, HTTPResponse } from "puppeteer";
import axios from "axios";
import https from "https";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");

export interface VerifyResult {
  success: boolean;
  data?: {
    payer: string | null;
    payerAccount: string | null;
    receiver: string | null;
    receiverAccount: string | null;
    amount: number | null;
    date: Date | null;
    reference: string | null;
    receiptNo?: string | null;
    total?: number | null;
    vat?: number | null;
    serviceFee?: number | null;
    serviceCharge?: number | null;
    totalAmount?: number | null;
    reason?: string | null;
  };
  error?: string;
}

const titleCase = (str: string): string =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === "production",
});

function parseCBEDate(dateText: string): Date {
  const commaIndex = dateText.indexOf(",");
  if (commaIndex !== -1) {
    const datePart = dateText.slice(0, commaIndex).trim();
    const timePart = dateText.slice(commaIndex + 1).trim();
    const parsed = new Date(`${datePart} ${timePart}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const fallback = new Date(dateText);
  if (!isNaN(fallback.getTime())) return fallback;
  throw new Error(`Unable to parse date: "${dateText}"`);
}

async function extractReferenceFromUploadedPdf(
  buffer: Buffer,
): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + " ";
  }

  const normalized = text.replace(/\s+/g, " ").trim();

  // pdfjs returns no text for scanned/image-only PDFs — distinguish that from
  // a PDF whose text simply doesn't match our reference pattern.
  if (normalized.length === 0) {
    throw new Error(
      "PDF contains no extractable text (likely a scanned image) — upload the original CBE PDF or a clear photo instead",
    );
  }

  const reference = normalized.match(
    /Reference\s+No\.?\s*\(VAT\s+Invoice\s+No\)\s+([A-Z0-9]+)/i,
  )?.[1];

  if (!reference) {
    throw new Error("No receipt reference found in uploaded PDF");
  }
  return reference;
}

export async function extractReferenceFromImage(
  buffer: Buffer,
): Promise<string> {
  const processedBuffer = await sharp(buffer)
    .rotate()
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: 2500 })
    .threshold(150)
    .toBuffer();

  const worker = await createWorker("eng");
  const { data } = await worker.recognize(processedBuffer);
  await worker.terminate();

  const text = data.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

  const matches = text.match(/\bFT[A-Z0-9]{8,}\b/g);
  if (!matches || matches.length === 0) {
    throw new Error("Reference not found in image");
  }

  const reference = matches.reduce((best, current) =>
    current.length >= best.length ? current : best,
  );

  return reference;
}

export async function verifyCBE(payload: {
  fileBuffer?: Buffer;
  reference?: string;
  accountSuffix?: string;
  fileType?: "pdf" | "image";
}): Promise<VerifyResult> {
  try {
    // When the user uploads the original CBE PDF it already contains every
    // field we need. Parse it directly so the upload succeeds WITHOUT asking
    // for accountSuffix/reference — those are only needed to re-fetch the
    // official PDF from the portal, which an uploaded PDF makes unnecessary.
    if (payload.fileBuffer && (payload.fileType ?? "pdf") === "pdf") {
      const parsed = await parseCBEReceipt(payload.fileBuffer);
      if (parsed.success) return parsed;
      // Not the official CBE PDF (or unparseable) — fall through to the
      // reference-extraction + portal-fetch path below.
    }

    let reference = payload.reference;

    if (!reference && payload.fileBuffer) {
      const fileType = payload.fileType ?? "pdf";
      reference =
        fileType === "pdf"
          ? await extractReferenceFromUploadedPdf(payload.fileBuffer)
          : await extractReferenceFromImage(payload.fileBuffer);
    }

    if (!reference) {
      return { success: false, error: "Reference not found" };
    }

    // From here we must call the CBE portal, which requires accountSuffix.
    if (!payload.accountSuffix) {
      return { success: false, error: "accountSuffix is required" };
    }

    const officialPdf = await fetchCBEReceiptPdfWithRetry(
      reference,
      payload.accountSuffix,
    );

    return await parseCBEReceipt(officialPdf);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function fetchCBEReceiptPdfWithRetry(
  reference: string,
  accountSuffix: string,
  maxAttempts = 3,
  delayMs = 2000,
): Promise<Buffer> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchCBEReceiptPdf(reference, accountSuffix);
    } catch (err: any) {
      lastError = err;
      console.warn(`Attempt ${attempt}/${maxAttempts} failed: ${err.message}`);
      if (attempt < maxAttempts) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }

  throw lastError ?? new Error("All attempts to fetch CBE receipt failed");
}

async function fetchCBEReceiptPdf(
  reference: string,
  accountSuffix: string,
): Promise<Buffer> {
  const fullId = `${reference.trim()}${accountSuffix.trim()}`;
  const url = `https://apps.cbe.com.et:100/?id=${fullId}`;

  let browser: Browser | null = null;
  let pdfUrl: string | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    );

    page.on("response", (response: HTTPResponse) => {
      const responseUrl = response.url();
      const ct = response.headers()["content-type"] || "";
      if (
        ct.includes("application/pdf") ||
        responseUrl.toLowerCase().endsWith(".pdf")
      ) {
        pdfUrl = responseUrl;
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    if (!pdfUrl) {
      pdfUrl = await page.evaluate((): string | null => {
        const selectors = [
          'embed[src*=".pdf"]',
          'iframe[src*=".pdf"]',
          'object[data*=".pdf"]',
          'a[href*=".pdf"]',
        ];
        for (const sel of selectors) {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (el) {
            return (
              (el as HTMLEmbedElement).src ||
              (el as HTMLObjectElement).data ||
              (el as HTMLAnchorElement).href ||
              null
            );
          }
        }
        return null;
      });
    }

    if (!pdfUrl) {
      throw new Error(
        `Receipt PDF not found on page for reference "${reference}". ` +
          `The CBE portal may have returned an error or the reference is invalid.`,
      );
    }

    const download = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      httpsAgent,
      timeout: 30000,
    });

    return Buffer.from(download.data);
  } finally {
    if (browser) await browser.close();
  }
}

export async function parseCBEReceipt(
  buffer: Buffer | ArrayBuffer,
): Promise<VerifyResult> {
  try {
    const pdfDocument = await pdfjs.getDocument({
      data: new Uint8Array(buffer instanceof Buffer ? buffer : buffer),
      standardFontDataUrl: "https://unpkg.com",
      useSystemFonts: true,
      disableFontFace: true,
    }).promise;

    let fullText = "";
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      fullText +=
        textContent.items.map((item: any) => item.str).join(" ") + "\n";
    }

    const rawText = fullText.replace(/\s+/g, " ").trim();

    const payerMatch = rawText.match(/Payer\s+(.*?)\s+Account\s+([\w*]+)/i);
    const receiverMatch = rawText.match(
      /Receiver\s+(.*?)\s+Account\s+([\w*]+)/i,
    );
    const refMatch = rawText.match(
      /Reference\s+No\.?\s*\(VAT\s+Invoice\s+No\)\s+([A-Z0-9]+)/i,
    );
    const amountMatch = rawText.match(
      /Transferred\s+Amount\s+([\d,]+\.\d{2})\s+ETB/i,
    );
    const dateMatch = rawText.match(
      /Payment\s+Date\s+&\s+Time\s+([\d\/,: ]+(?:AM|PM))/i,
    );
    const reasonMatch = rawText.match(
      /Reason\s*\/\s*Type\s+of\s+service\s+(.*?)\s+Transferred/i,
    );

    const payerName = payerMatch?.[1]?.trim();
    const payerAccount = payerMatch?.[2]?.trim();
    const receiverName = receiverMatch?.[1]?.trim();
    const receiverAccount = receiverMatch?.[2]?.trim();
    const reference = refMatch?.[1]?.trim();
    const amountText = amountMatch?.[1]?.trim();
    const dateText = dateMatch?.[1]?.trim();

    if (payerName && receiverName && reference && amountText && dateText) {
      return {
        success: true,
        data: {
          payer: titleCase(payerName),
          payerAccount: payerAccount || "N/A",
          receiver: titleCase(receiverName),
          receiverAccount: receiverAccount || "N/A",
          amount: parseFloat(amountText.replace(/,/g, "")),
          date: parseCBEDate(dateText), // FIX (Bug 4)
          reference,
          reason: reasonMatch?.[1]?.trim() || null,
        },
      };
    }

    const missing: string[] = [];
    if (!payerName) missing.push("Payer");
    if (!receiverName) missing.push("Receiver");
    if (!reference) missing.push("Reference");
    if (!amountText) missing.push("Amount");
    if (!dateText) missing.push("Date");

    return {
      success: false,
      error: `Could not extract: ${missing.join(", ")}`,
    };
  } catch (err: any) {
    return { success: false, error: "Failed to parse PDF: " + err.message };
  }
}
