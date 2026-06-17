import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";
import puppeteer from "puppeteer";
import Tesseract from "tesseract.js";
import { fromBuffer } from "pdf2pic";

const clean = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

function detectFileType(buffer: Buffer): "pdf" | "image" {
  return buffer.slice(0, 4).toString() === "%PDF" ? "pdf" : "image";
}

function validateReference(ref: string): boolean {
  return /^FT[A-Z0-9]{8,}$/i.test(ref);
}
function fixOcrReference(ref: string): string {
  return ref.replace(/1/g, "T").replace(/0/g, "O").replace(/I/g, "1");
}

async function convertPdfToImage(buffer: Buffer): Promise<Buffer> {
  const converter = fromBuffer(buffer, {
    density: 600,
    format: "png",
    savePath: "/tmp",
    saveFilename: "page",
  });

  const page = await converter(1);

  if (!page.path) {
    throw new Error("PDF conversion failed");
  }

  return fs.readFileSync(page.path);
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => i.str).join(" ") + " ";
  }

  return clean(fullText);
}

async function extractTextWithFallback(buffer: Buffer): Promise<string> {
  let text = await extractTextFromPdf(buffer);

  if (!text || text.length < 50) {
    const imageBuffer = await convertPdfToImage(buffer);
    const ocr = await Tesseract.recognize(imageBuffer, "eng");
    text = ocr.data.text;
  }

  return clean(text);
}

function extractReference(text: string): string | null {
  const match = text.match(
    /Transaction\s*Reference[:\s]*\n?\s*(FT[A-Z0-9]{8,})/i,
  );

  return match ? match[1].toUpperCase() : null;
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
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}

export interface VerifyResult {
  success: boolean;
  data?: any;
  error?: string;
}

function parseSlip(text: string): VerifyResult {
  if (!text || text.length < 50) {
    return {
      success: false,
      error: "Slip content invalid or empty",
    };
  }

  const reference =
    text.match(/Transaction Reference\s+([A-Z0-9]+)/i)?.[1] || null;

  const payerAccount = text.match(/Source Account\s+([\w*]+)/i)?.[1] || null;

  const payer =
    text.match(/Source Account Name\s+(.+?)\s+(Transferred|Service)/i)?.[1] ||
    null;

  const amountRaw =
    text.match(/Transferred amount\s+ETB\s*([\d,]+\.\d{2})/i)?.[1] || null;

  if (!reference || !payerAccount || !amountRaw) {
    return {
      success: false,
      error: "Slip parsing failed — invalid reference or corrupted slip",
    };
  }

  return {
    success: true,
    data: {
      payer,
      payerAccount,
      receiver: null,
      receiverAccount: null,
      amount: parseFloat(amountRaw.replace(/,/g, "")),
      reference,
    },
  };
}

export async function verifyAbyssinia(input: {
  reference?: string;
  accountSuffix?: string;
  fileBuffer?: Buffer;
  filePath?: string;
  fileType?: "pdf" | "image";
}): Promise<VerifyResult> {
  try {
    if (!input.accountSuffix) {
      return { success: false, error: "Account suffix is required" };
    }

    let reference = input.reference;
    let pdfBuffer: Buffer | undefined;

    if (input.fileBuffer) {
      const type = detectFileType(input.fileBuffer);
      let text = "";

      if (type === "pdf") {
        // NB: assign the OUTER `text` — a shadowing `let text` here left the
        // outer variable empty, so the reference was never extracted from
        // uploaded Abyssinia PDFs.
        text = await extractTextFromPdf(input.fileBuffer);

        if (!text || text.length < 100) {
          const imageBuffer = await convertPdfToImage(input.fileBuffer);
          const ocr = await Tesseract.recognize(imageBuffer, "eng");
          text = clean(ocr.data.text);
        }
      } else {
        const ocr = await Tesseract.recognize(input.fileBuffer, "eng");
        text = clean(ocr.data.text);
      }

      reference = extractReference(text) ?? undefined;

      if (!reference || !validateReference(reference)) {
        return {
          success: false,
          error: "Invalid or corrupted reference extracted from file",
        };
      }

      pdfBuffer = await fetchSlipPdf(reference, input.accountSuffix);
    } else {
      if (!reference || !validateReference(reference)) {
        return {
          success: false,
          error: "Valid transaction reference is required",
        };
      }

      pdfBuffer = await fetchSlipPdf(reference, input.accountSuffix);
    }

    if (!pdfBuffer) {
      return { success: false, error: "Failed to retrieve slip PDF" };
    }

    let officialText = await extractTextFromPdf(pdfBuffer);

    if (!officialText || officialText.length < 100) {
      const imageBuffer = await convertPdfToImage(pdfBuffer);
      const ocr = await Tesseract.recognize(imageBuffer, "eng");
      officialText = clean(ocr.data.text);
    }

    const parsed = parseSlip(officialText);

    if (!parsed.success) {
      return {
        success: true,
        data: {
          payer: parsed.data?.payer ?? null,
          receiver: parsed.data?.receiver ?? null,
          amount: parsed.data?.amount ?? null,
          reference: parsed.data?.reference ?? null,
          reason: null,
          date: null,
        },
      };
    }

    if (parsed.data.reference !== reference) {
      return {
        success: false,
        error: "Reference mismatch — OCR may have extracted incorrect value",
      };
    }

    return parsed;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Abyssinia verification failed",
    };
  }
}
