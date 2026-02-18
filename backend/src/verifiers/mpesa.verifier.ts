import puppeteer, { Browser, HTTPResponse } from "puppeteer";
import { VerifyResult } from "./cbe.verifier";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import https from "https";
import axios from "axios";

function normalizeText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function extractReference(text: string): string | null {
  const match = text.match(/UBH[A-Z0-9]{6,}/i);
  return match ? match[0].toUpperCase() : null;
}

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({
    data: uint8Array,
    standardFontDataUrl:
      "https://unpkg.com/pdfjs-dist@2.16.105/legacy/web/cmaps/",
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => i.str).join(" ") + "\n";
  }

  return fullText;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  return extractTextFromPdfBuffer(buffer);
}

async function extractTextFromImage(filePath: string): Promise<string> {
  const result = await Tesseract.recognize(filePath, "eng+amh"); // OCR supports Amharic
  return result.data.text;
}

async function fetchMpesaPdf(reference: string): Promise<Buffer> {
  const url = `https://m-pesabusiness.safaricom.et/receipt/${reference}`;

  let browser: Browser | null = null;
  let pdfUrl: string | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    page.on("response", (response: HTTPResponse) => {
      const ct = response.headers()["content-type"];
      if (ct && ct.includes("application/pdf")) pdfUrl = response.url();
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const start = Date.now();
    while (!pdfUrl && Date.now() - start < 15000) {
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!pdfUrl) throw new Error("PDF not generated from M-PESA page");

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      httpsAgent,
    });

    return Buffer.from(response.data);
  } finally {
    if (browser) await browser.close();
  }
}

function parseMpesaPdfText(text: string): VerifyResult {
  const lines = normalizeText(text);

  let reference: string | null = null;
  let receiptNo: string | null = null;
  let amount: number | null = null;
  let total: number | null = null;
  let vat: number | null = null;
  let serviceFee: number | null = null;
  let date: Date | null = null;
  let sender: string | null = null;
  let senderPhone: string | null = null;
  let receiverBank: string | null = null;
  let receiverAccount: string | null = null;

  for (const line of lines) {
    const l = line.trim();

    if (!sender) {
      const m = l.match(/(?:የላኪ ስም|SENDER NAME)\s*\/?\s*(.+)$/i);
      if (m) sender = m[1].trim();
    }

    if (!senderPhone) {
      const m = l.match(
        /(?:የላኪ ስልክ ቁጥር|SENDER PHONE NUMBER)\s*\/?\s*(251\d{9})/i,
      );
      if (m) senderPhone = m[1].trim();
    }

    if (!receiverBank) {
      const m = l.match(/(?:የተቀባዩ ባንክ ስም|RECEIVER BANK NAME)\s*\/?\s*(.+)$/i);
      if (m) receiverBank = m[1].trim();
    }

    if (!receiverAccount) {
      const m = l.match(
        /(?:የባንክ አካውንት ቁጥር|BANK ACCOUNT NUMBER)\s*\/?\s*(\d{6,})/i,
      );
      if (m) receiverAccount = m[1].trim();
    }

    if (!reference) {
      const m = l.match(/(UBH[A-Z0-9]{6,})/i);
      if (m) reference = m[1].trim();
    }

    if (!receiptNo) {
      const m = l.match(/(?:ደረሰኝ ቁጥር|RECEIPT NO)\s*\/?\s*([A-Z0-9]{4,})/i);
      if (m) receiptNo = m[1].trim();
    }

    if (!date) {
      const m = l.match(
        /(?:የክፍያ ቀን|PAYMENT DATE)\s*\/?\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/i,
      );
      if (m) date = new Date(m[1].trim());
    }

    if (!amount) {
      const m = l.match(
        /(?:የገንዘብ መጠን|SETTLED AMOUNT)\s*\/?\s*([\d,]+\.\d{2})/i,
      );
      if (m) amount = parseFloat(m[1].replace(/,/g, ""));
    }

    if (!total) {
      const m = l.match(/(?:ጠቅላላ|TOTAL)\s*\/?\s*([\d,]+\.\d{2})/i);
      if (m) total = parseFloat(m[1].replace(/,/g, ""));
    }

    if (!vat) {
      const m = l.match(/(?:ተጨማሪ እሴት ታክስ|\+ 15% VAT)\s*\/?\s*([\d,]+\.\d{2})/i);
      if (m) vat = parseFloat(m[1].replace(/,/g, ""));
    }

    if (!serviceFee) {
      const m = l.match(/(?:የአገልግሎት ክፍያ|SERVICE FEE)\s*\/?\s*([\d,]+\.\d{2})/i);
      if (m) serviceFee = parseFloat(m[1].replace(/,/g, ""));
    }
  }

  return {
    success: true,
    data: {
      payer: sender,
      payerAccount: senderPhone,
      receiver: receiverBank,
      receiverAccount,
      amount,
      date,
      reference,
      receiptNo,
      total,
      vat,
      serviceFee,
    },
  };
}

export async function verifyMPesa(input: {
  reference?: string;
  filePath?: string;
}): Promise<VerifyResult> {
  try {
    let reference = input.reference;

    if (input.filePath) {
      const ext = path.extname(input.filePath).toLowerCase();
      let text = "";

      if (ext === ".pdf") text = await extractTextFromPdf(input.filePath);
      else text = await extractTextFromImage(input.filePath);

      const refFromFile = extractReference(text);
      if (!refFromFile)
        return {
          success: false,
          error: "Transaction reference not found in file",
        };

      reference = refFromFile;
    }

    if (!reference)
      return { success: false, error: "Transaction reference is required" };

    const pdfBuffer = await fetchMpesaPdf(reference);

    const uint8Array = new Uint8Array(pdfBuffer);
    const pdfDoc = await pdfjs.getDocument({ data: uint8Array }).promise;
    let fullText = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((i: any) => i.str).join(" ") + "\n";
    }

    return parseMpesaPdfText(fullText);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "MPESA verification failed",
    };
  }
}
