import puppeteer, { Browser } from "puppeteer";
import { VerifyResult } from "./cbe.verifier";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

const clean = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

function extractReference(text: string): string | null {
  const match = text.match(/FT[A-Z0-9]{10,}/i);
  return match ? match[0].toUpperCase() : null;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => i.str).join(" ") + " ";
  }

  return clean(fullText);
}

async function extractTextFromImage(filePath: string): Promise<string> {
  const result = await Tesseract.recognize(filePath, "eng");
  return clean(result.data.text);
}

async function fetchSlipText(
  reference: string,
  accountSuffix: string,
): Promise<string> {
  const fullId = `${reference}${accountSuffix}`;
  const url = `https://cs.bankofabyssinia.com/slip/?trx=${fullId}`;

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForSelector("body", { timeout: 20000 });

    await new Promise((r) => setTimeout(r, 2500));

    const text = await page.evaluate(() => document.body.innerText);

    return clean(text);
  } finally {
    if (browser) await browser.close();
  }
}

function parseSlip(text: string): VerifyResult {
  if (!text || text.length < 30) {
    return {
      success: false,
      error: "Slip page returned empty or invalid content",
    };
  }

  const reference = extractReference(text);

  const receiver =
    text.match(/Receiver.*?Name\s+(.*?)\s+(Account|Amount)/i)?.[1] ||
    text.match(/Beneficiary.*?Name\s+(.*?)\s+(Account|Amount)/i)?.[1] ||
    null;

  const receiverAccount =
    text.match(/Account\s+Number\s+([\w*]+)/i)?.[1] ||
    text.match(/Receiver.*?Account\s+([\w*]+)/i)?.[1] ||
    null;

  const amountRaw =
    text.match(/ETB\s*([\d,]+\.\d{2})/i)?.[1] ||
    text.match(/Amount\s+([\d,]+\.\d{2})/i)?.[1] ||
    null;

  const dateRaw =
    text.match(/Date\s+([\d\/:\s]+)/i)?.[1] ||
    text.match(/Transaction\s+Date\s+([\d\/:\s]+)/i)?.[1] ||
    null;

  return {
    success: true,
    data: {
      payer: null,
      payerAccount: null,
      receiver: receiver ? receiver.trim() : null,
      receiverAccount: receiverAccount ? receiverAccount.trim() : null,
      amount: amountRaw ? parseFloat(amountRaw.replace(/,/g, "")) : null,
      date: dateRaw ? new Date(dateRaw.trim()) : null,
      reference: reference,
      reason: null,
    },
  };
}

export async function verifyAbyssinia(
  reference: string,
  accountSuffix: string,
  filePath?: string,
): Promise<VerifyResult> {
  try {
    let finalReference = reference;

    if (filePath) {
      const ext = path.extname(filePath).toLowerCase();
      let extractedText = "";

      if (ext === ".pdf") {
        extractedText = await extractTextFromPdf(filePath);
      } else {
        extractedText = await extractTextFromImage(filePath);
      }

      const refFromFile = extractReference(extractedText);

      if (!refFromFile) {
        return {
          success: false,
          error: "Transaction reference not found in uploaded file",
        };
      }

      finalReference = refFromFile;
    }

    if (!finalReference || !accountSuffix) {
      return {
        success: false,
        error: "Reference and account suffix are required",
      };
    }

    const slipText = await fetchSlipText(finalReference, accountSuffix);

    return parseSlip(slipText);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Abyssinia verification failed",
    };
  }
}
