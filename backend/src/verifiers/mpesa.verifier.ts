import puppeteer, { Browser } from "puppeteer";
import { VerifyResult } from "./cbe.verifier";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

function normalizeText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\/?\s*/, "").trim())
    .filter((line) => line.length > 0);
}

function extractReference(text: string): string | null {
  const match = text.match(/UBH[A-Z0-9]{6,}/i);
  return match ? match[0].toUpperCase() : null;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => i.str).join(" ") + "\n";
  }

  return fullText;
}

async function extractTextFromImage(filePath: string): Promise<string> {
  const result = await Tesseract.recognize(filePath, "eng");
  return result.data.text;
}

async function fetchSlipText(reference: string): Promise<string> {
  const url = `https://m-pesabusiness.safaricom.et/receipt/${reference}`;

  let browser: Browser | null = null;
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
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector("body", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    const text = await page.evaluate(() => document.body.innerText);
    return text;
  } finally {
    if (browser) await browser.close();
  }
}

function parseMpesaFields(lines: string[]): VerifyResult {
  let reference: string | null = null;
  let sender: string | null = null;
  let senderPhone: string | null = null;
  let receiver: string | null = null;
  let receiverAccount: string | null = null;
  let amount: number | null = null;
  let date: Date | null = null;

  for (const line of lines) {
    const l = line.toUpperCase();

    if (!reference && l.includes("TRANSACTION ID")) {
      const match = line.match(/([A-Z0-9]{8,})/);
      if (match) reference = match[1];
    }

    if (!sender && l.includes("SENDER NAME")) {
      sender = line.replace(/SENDER NAME\s*:?\s*/i, "").trim();
    }

    if (!senderPhone && l.includes("SENDER PHONE")) {
      const match = line.match(/(\+?\d{7,})/);
      if (match) senderPhone = match[1];
    }

    if (!receiver && l.includes("RECEIVER NAME")) {
      receiver = line.replace(/RECEIVER NAME\s*:?\s*/i, "").trim();
    }

    if (!receiverAccount && l.includes("RECEIVER ACCOUNT NUMBER")) {
      const match = line.match(/([\d-]+)/);
      if (match) receiverAccount = match[1];
    }

    if (!amount && l.includes("TOTAL")) {
      const match = line.match(/([\d,]+\.\d{2})/);
      if (match) amount = parseFloat(match[1].replace(/,/g, ""));
    }

    if (
      !date &&
      (l.includes("PAYMENT DATE") || l.includes("TRANSACTION DATE"))
    ) {
      const match = line.match(/(\d{2}\/\d{2}\/\d{4}[ \d:AMP]{0,20})/i);
      if (match) date = new Date(match[1]);
    }
  }

  if (!reference || !amount || !date) {
    const missing = [];
    if (!reference) missing.push("Reference");
    if (!amount) missing.push("Amount");
    if (!date) missing.push("Date");
    return { success: false, error: "Missing fields: " + missing.join(", ") };
  }

  return {
    success: true,
    data: {
      payer: sender,
      payerAccount: senderPhone,
      receiver,
      receiverAccount,
      amount,
      date,
      reference,
    },
  };
}

export async function verifyMPesa(input: {
  reference?: string;
  filePath?: string;
}): Promise<VerifyResult> {
  try {
    let reference = input.reference || "";

    if (input.filePath) {
      const ext = path.extname(input.filePath).toLowerCase();
      let text = "";

      if (ext === ".pdf") {
        text = await extractTextFromPdf(input.filePath);
      } else {
        text = await extractTextFromImage(input.filePath);
      }

      const refFromFile = extractReference(text);
      if (!refFromFile) {
        return {
          success: false,
          error: "Transaction reference not found in uploaded file",
        };
      }
      reference = refFromFile;
    }

    if (!reference) {
      return { success: false, error: "Transaction reference is required" };
    }

    const rawText = await fetchSlipText(reference);

    const lines = normalizeText(rawText);

    return parseMpesaFields(lines);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "MPESA verification failed",
    };
  }
}
