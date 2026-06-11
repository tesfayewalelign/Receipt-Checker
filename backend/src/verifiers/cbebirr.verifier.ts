import axios from "axios";
import https from "https";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import Tesseract from "tesseract.js";
import logger from "../utils/logger";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = undefined;

const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.ALLOW_SELF_SIGNED_CERTS !== "true",
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CBEBirrVerifyResult {
  success: boolean;
  customerName?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  receiverName?: string | null;
  orderId?: string | null;
  transactionStatus?: string | null;
  receiptNumber?: string | null;
  transactionDate?: Date | null;
  amount?: number | null;
  paidAmount?: number | null;
  serviceCharge?: number | null;
  vat?: number | null;
  totalPaidAmount?: number | null;
  paymentReason?: string | null;
  paymentChannel?: string | null;
  error?: string;
}

async function extractReceiptFromPDFBuffer(
  buffer: Buffer,
): Promise<string | null> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
      .promise;

    let rawText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      rawText += content.items.map((item: any) => item.str).join(" ") + " ";
    }

    // Match CBE receipt number format: CL followed by alphanumeric chars
    const match = rawText.match(/\bCL[A-Z0-9]{5,}\b/i);
    if (!match) {
      logger.warn("[CBEBirr] No CL receipt number found in PDF");
      return null;
    }

    return match[0].toUpperCase();
  } catch (err: any) {
    logger.error("[CBEBirr] PDF extraction error:", err.message);
    return null;
  }
}

async function extractReceiptFromImageBuffer(
  buffer: Buffer,
): Promise<string | null> {
  try {
    const result = await Tesseract.recognize(buffer, "eng");
    const text = result.data.text.replace(/\s+/g, "");
    const match = text.match(/CL[A-Z0-9]{5,}/i);
    if (!match) {
      logger.warn("[CBEBirr] No CL receipt number found in image");
      return null;
    }
    return match[0].toUpperCase();
  } catch (err: any) {
    logger.error("[CBEBirr] Image extraction error:", err.message);
    return null;
  }
}

function sanitizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+251")) {
    return "0" + cleaned.slice(4); // +251911... → 0911...
  }
  if (cleaned.startsWith("251")) {
    return "0" + cleaned.slice(3); // 251911... → 0911...
  }
  return cleaned; // already local format
}

function parseCBEDate(raw: string): Date | null {
  try {
    // Format: YYYY-MM-DD HH:MM or YYYY-MM-DD HH:MM:SS
    const parts = raw.trim().split(/[\s\-:]/);
    if (parts.length < 5) return null;

    return new Date(
      Number(parts[0]), // year
      Number(parts[1]) - 1, // month (0-based)
      Number(parts[2]), // day
      Number(parts[3]), // hour
      Number(parts[4]), // minute
      Number(parts[5] ?? 0), // second
    );
  } catch {
    return null;
  }
}

// ── PDF text extractor (shared helper) ───────────────────────────────────────
async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
    .promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }

  return text.replace(/\s+/g, " ").trim();
}

// ── Main verifier ─────────────────────────────────────────────────────────────

export async function verifyCBEBirr(input: {
  reference?: string | null;
  phoneNumber: string;

  fileBuffer?: Buffer;
  fileType?: "pdf" | "image";
}): Promise<CBEBirrVerifyResult> {
  try {
    let { reference, phoneNumber, fileBuffer, fileType } = input;

    // ── Validate phone number ───────────────────────────────────────────────
    if (!phoneNumber) {
      return { success: false, error: "Phone number is required" };
    }

    const cleanPhone = sanitizePhoneNumber(phoneNumber);
    if (!/^0[79]\d{8}$/.test(cleanPhone)) {
      return {
        success: false,
        error: `Invalid phone number format: ${phoneNumber}. Expected Ethiopian mobile number.`,
      };
    }

    // ── Extract receipt number from file if not provided directly ───────────
    if (!reference) {
      if (!fileBuffer) {
        return {
          success: false,
          error: "Reference or receipt file is required",
        };
      }

      logger.info("[CBEBirr] Extracting reference from uploaded file");

      if (fileType === "pdf") {
        reference = await extractReceiptFromPDFBuffer(fileBuffer);
      } else if (fileType === "image") {
        reference = await extractReceiptFromImageBuffer(fileBuffer);
      } else {
        return {
          success: false,
          error: "Unsupported file type. Use pdf or image.",
        };
      }

      if (!reference) {
        return {
          success: false,
          error: "Could not extract reference from file",
        };
      }

      logger.info(`[CBEBirr] Extracted reference: ${reference}`);
    }

    // ── Fetch PDF receipt from CBE ──────────────────────────────────────────
    const url = `https://cbepay1.cbe.com.et/aureceipt?TID=${encodeURIComponent(reference)}&PH=${encodeURIComponent(cleanPhone)}`;

    logger.info(`[CBEBirr] Fetching receipt for: ${reference}`);

    const response = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      httpsAgent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });

    if (!response.data) {
      return { success: false, error: "Empty response from CBE server" };
    }

    const contentType = response.headers["content-type"];

    if (typeof contentType !== "string" || !contentType.includes("pdf")) {
      logger.warn("[CBEBirr] Response content-type:", contentType);

      return {
        success: false,
        error:
          "CBE server did not return a PDF. Receipt may not exist or phone number is wrong.",
      };
    }

    // ── Parse the PDF receipt ───────────────────────────────────────────────
    const text = await extractTextFromPDFBuffer(Buffer.from(response.data));

    logger.info(
      "[CBEBirr] Extracted PDF text (first 300 chars):",
      text.slice(0, 300),
    );

    // Helper: extract value after a label
    const extract = (regex: RegExp): string | null =>
      text.match(regex)?.[1]?.trim() ?? null;

    // FIX 6: Parse date explicitly
    const dateMatch = text.match(
      /(\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}(?::\d{2})?)/,
    );
    const transactionDate = dateMatch ? parseCBEDate(dateMatch[1]) : null;

    // FIX 7: Extract amounts by label, not by position
    // "position 0" is unreliable — the first number could be an account number
    const extractAmount = (keyword: string): number | null => {
      const match = text.match(
        new RegExp(`${keyword}[^\\d]*(\\d+\\.\\d{2})`, "i"),
      );
      return match ? parseFloat(match[1]) : null;
    };

    const paidAmount = extractAmount("Paid[\\s]*[Aa]mount");
    const serviceCharge = extractAmount("Service[\\s]*Charge");
    const vat = extractAmount("VAT");
    const totalPaidAmount = extractAmount("Total[\\s]*Paid[\\s]*Amount");

    // Use "Amount" label for main amount, fall back to first decimal number
    const amount =
      extractAmount("(?<![A-Za-z])Amount(?![A-Za-z])") ??
      (() => {
        const all = [...text.matchAll(/(\d+\.\d{2})/g)].map((m) =>
          parseFloat(m[1]),
        );
        // Pick smallest non-zero amount (least likely to be total)
        return all.filter((n) => n > 0).sort((a, b) => a - b)[0] ?? null;
      })();

    const result: CBEBirrVerifyResult = {
      success: true,
      customerName: extract(/Debit\s*Account\s*\d+\s*-\s*(.*?)\s+Credit/i),
      debitAccount: extract(/Debit\s*Account\s*([0-9]+)/i),
      creditAccount: extract(/Credit\s*Account\s*([0-9*]+)/i),
      receiverName: extract(/Receiver\s*Name\s*(.*?)\s+Order/i),
      orderId: extract(/Order\s*ID\s*([A-Z0-9]+)/i),
      transactionStatus: extract(/Transaction\s*Status\s*(\w+)/i),
      receiptNumber: extract(/(CL[A-Z0-9]+)/i) ?? reference,
      transactionDate,
      amount,
      paidAmount,
      serviceCharge,
      vat,
      totalPaidAmount:
        totalPaidAmount ??
        (() => {
          const all = [...text.matchAll(/(\d+\.\d{2})/g)].map((m) =>
            parseFloat(m[1]),
          );
          return all.length ? Math.max(...all) : null;
        })(),
      paymentReason: extract(/Payment\s*Reason\s*(.*?)\s+Payment\s*Channel/i),
      paymentChannel: extract(/Payment\s*Channel\s*(\w+)/i),
    };

    // Warn if critical fields are missing
    if (
      !result.amount ||
      !result.transactionDate ||
      !result.transactionStatus
    ) {
      logger.warn("[CBEBirr] Some fields could not be parsed from PDF:", {
        amount: result.amount,
        transactionDate: result.transactionDate,
        transactionStatus: result.transactionStatus,
      });
    }

    logger.info(`[CBEBirr] ✅ Verification SUCCESS for: ${reference}`);
    return result;
  } catch (err: any) {
    logger.error("[CBEBirr] Verification failed:", err.message);
    return { success: false, error: err?.message || "Verification failed" };
  }
}
