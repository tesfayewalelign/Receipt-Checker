import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";
import puppeteer from "puppeteer";
import Tesseract from "tesseract.js";

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
    reason: string | null;
    serviceCharge?: number | null;
    vat?: number | null;
    totalAmount?: number | null;
  };
  error?: string;
}

const clean = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

function extractReference(text: string): string | null {
  const match = text.match(/FT[A-Z0-9]{10,}/i);
  return match ? match[0].toUpperCase() : null;
}

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => i.str).join(" ") + " ";
  }
  return clean(fullText);
}

async function extractReferenceFromImage(buffer: Buffer): Promise<string> {
  const result = await Tesseract.recognize(buffer, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text") {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });
  const text = clean(result.data.text);
  const reference = extractReference(text);
  if (!reference) throw new Error("Reference not found in uploaded image");
  return reference;
}

export async function fetchSlipPdf(
  reference: string,
  accountSuffix: string,
): Promise<Buffer> {
  const url = `https://cs.bankofabyssinia.com/slip/?trx=${reference}${accountSuffix}`;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForSelector("table", { timeout: 15000 });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();
  return Buffer.from(pdfBuffer);
}

function parseTransactionDate(raw: string | null): Date | null {
  if (!raw) return null;
  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/);
  if (!match) return null;
  const [_, yy, mm, dd, hh, min] = match;
  const year = 2000 + parseInt(yy, 10);
  const month = parseInt(mm, 10) - 1;
  const day = parseInt(dd, 10);
  const hour = parseInt(hh, 10);
  const minute = parseInt(min, 10);
  return new Date(year, month, day, hour, minute);
}

function parseSlip(text: string): VerifyResult {
  if (!text || text.length < 30) {
    return {
      success: false,
      error: "Slip PDF returned empty or invalid content",
    };
  }

  const reference =
    text.match(/Transaction Reference\s+([A-Z0-9]+)/i)?.[1] || null;
  const sourceAccount = text.match(/Source Account\s+([\w*]+)/i)?.[1] || null;
  const sourceAccountName =
    text.match(/Source Account Name\s+(.+?)\s+(Transferred|Service)/i)?.[1] ||
    null;
  const transferredAmountRaw =
    text.match(/Transferred amount\s+ETB\s*([\d,]+\.\d{2})/i)?.[1] || null;
  const serviceChargeRaw =
    text.match(/Service Charge\s+ETB\s*([\d,]+\.\d{2})/i)?.[1] || null;
  const vatRaw = text.match(/VAT\(15%\)\s+ETB\s*([\d,]+\.\d{2})/i)?.[1] || null;
  const totalAmountRaw =
    text.match(/Total Amount\s+ETB\s*([\d,]+\.\d{2})/i)?.[1] || null;
  const transactionType =
    text.match(/Transaction Type\s+(.+?)\s+(Transaction Date)/i)?.[1]?.trim() ||
    null;
  const transactionDateRaw =
    text.match(/Transaction Date\s+([\d\/:\s]+)/i)?.[1] || null;

  return {
    success: true,
    data: {
      payer: sourceAccountName,
      payerAccount: sourceAccount,
      receiver: null,
      receiverAccount: null,
      amount: transferredAmountRaw
        ? parseFloat(transferredAmountRaw.replace(/,/g, ""))
        : null,
      date: parseTransactionDate(transactionDateRaw),
      reference,
      reason: transactionType,
      serviceCharge: serviceChargeRaw
        ? parseFloat(serviceChargeRaw.replace(/,/g, ""))
        : null,
      vat: vatRaw ? parseFloat(vatRaw.replace(/,/g, "")) : null,
      totalAmount: totalAmountRaw
        ? parseFloat(totalAmountRaw.replace(/,/g, ""))
        : null,
    },
  };
}

export async function verifyAbyssinia(input: {
  reference?: string;
  accountSuffix?: string;
  filePath?: string;
  fileBuffer?: Buffer;
  fileType?: "pdf" | "image";
}): Promise<VerifyResult> {
  try {
    if (!input.accountSuffix && !input.filePath && !input.fileBuffer) {
      return { success: false, error: "Account suffix is required" };
    }

    let reference: string | undefined = input.reference;
    let pdfBuffer: Buffer;

    if (input.fileBuffer) {
      if (!input.fileType)
        return { success: false, error: "fileType must be specified" };

      if (input.fileType === "pdf") {
        const text = await extractTextFromPdfBuffer(input.fileBuffer);
        reference = extractReference(text) ?? undefined;
        if (!reference) throw new Error("Reference not found in uploaded PDF");

        pdfBuffer = await fetchSlipPdf(reference, input.accountSuffix!);
      } else if (input.fileType === "image") {
        reference = await extractReferenceFromImage(input.fileBuffer);
        pdfBuffer = await fetchSlipPdf(reference, input.accountSuffix!);
      } else {
        return { success: false, error: "Unsupported fileType" };
      }
    } else if (input.filePath) {
      if (!fs.existsSync(input.filePath))
        return { success: false, error: "File path does not exist" };

      pdfBuffer = fs.readFileSync(input.filePath);
      const text = await extractTextFromPdfBuffer(pdfBuffer);
      reference = extractReference(text) ?? undefined;
      if (!reference) throw new Error("Reference not found in uploaded PDF");

      pdfBuffer = await fetchSlipPdf(reference, input.accountSuffix!);
    } else {
      if (!reference)
        return { success: false, error: "Transaction reference is required" };
      pdfBuffer = await fetchSlipPdf(reference, input.accountSuffix!);
    }

    const pdfText = await extractTextFromPdfBuffer(pdfBuffer);
    return parseSlip(pdfText);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Abyssinia verification failed",
    };
  }
}
