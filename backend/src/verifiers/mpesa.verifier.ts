import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import https from "https";
import axios from "axios";
import { VerifyResult } from "./cbe.verifier";

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
  const pdf = await pdfjs.getDocument({
    data: uint8Array,
    standardFontDataUrl:
      "https://unpkg.com/pdfjs-dist@2.16.105/legacy/web/cmaps/",
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;

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
  const result = await Tesseract.recognize(filePath, "eng+amh");
  return result.data.text;
}

async function fetchMpesaPdf(reference: string): Promise<Buffer> {
  const url = `https://m-pesabusiness.safaricom.et/receipt/${reference}`;

  let pdfUrl: string | null = null;
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

  page.on("response", (response) => {
    const ct = response.headers()["content-type"];
    if (ct && ct.includes("application/pdf")) pdfUrl = response.url();
  });

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  const start = Date.now();
  while (!pdfUrl && Date.now() - start < 15000) {
    await new Promise((r) => setTimeout(r, 500));
  }

  await browser.close();

  if (!pdfUrl) throw new Error("PDF not generated from M-PESA page");

  const response = await axios.get(pdfUrl, {
    responseType: "arraybuffer",
    httpsAgent,
  });
  return Buffer.from(response.data);
}

function parseMpesaPdfText(text: string): VerifyResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let payer: string | null = null;
  let payerAccount: string | null = null;
  let receiver: string | null = null;
  let receiverAccount: string | null = null;
  let amount: number | null = null;
  let totalAmount: number | null = null;
  let serviceCharge: number | null = null;
  let vat: number | null = null;
  let date: Date | null = null;
  let reference: string | null = null;
  let reason: string | null = null;

  const fullText = lines.join(" ");

  reference = fullText.match(/UBH[A-Z0-9]{7,}/i)?.[0] || null;

  const dateMatch = fullText.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  if (dateMatch) date = new Date(dateMatch[1]);

  const nameLabelMatch = fullText.match(
    /SENDER NAME\s+([A-Za-z\s]+?)\s+(251\d{9})/i,
  );

  if (nameLabelMatch) {
    payer = nameLabelMatch[1].trim();
    payerAccount = nameLabelMatch[2].trim();
  } else {
    const genericNameMatch = fullText.match(
      /NAME\s+([A-Za-z\s]+?)\s+(251\d{9})/i,
    );

    if (genericNameMatch) {
      payer = genericNameMatch[1].trim();
      payerAccount = genericNameMatch[2].trim();
    } else {
      const phoneMatch = fullText.match(/(251\d{9})/);
      if (phoneMatch) {
        payerAccount = phoneMatch[1];

        const wordsBefore = fullText
          .substring(0, phoneMatch.index)
          .split(/\s+/)
          .filter(Boolean);

        const candidate = wordsBefore.slice(-5).join(" ");

        const cleaned = candidate
          .replace(
            /SENDER|NAME|NUMBER|PHONE|TEL|ACCOUNT|ID|NO|M-PESA|THANK|YOU/gi,
            "",
          )
          .trim();

        if (/^[A-Za-z]+\s+[A-Za-z]+/.test(cleaned)) {
          payer = cleaned;
        } else {
          payer = "M-PESA User";
        }
      }
    }
  }

  const bankMatch = fullText.match(/Commercial Bank of Ethiopia/i);
  const accMatch = fullText.match(/(\d{13})/);
  if (bankMatch) receiver = bankMatch[0];
  if (accMatch) receiverAccount = accMatch[0];

  const settledMatch =
    fullText.match(/SETTLED AMOUNT\s+([0-9]+\.[0-9]{2})/i) ||
    fullText.match(/SETTLED AMOUNT.*?(\d+\.\d{2})/i);

  if (settledMatch) amount = parseFloat(settledMatch[1]);

  const serviceFeeMatch = fullText.match(
    /SERVICE FEE\s+([0-9]+(?:\.[0-9]{1,2})?)/i,
  );

  if (serviceFeeMatch) serviceCharge = parseFloat(serviceFeeMatch[1]);

  const vatMatch = fullText.match(/VAT\s+([0-9]+(?:\.[0-9]{1,2})?)/i);

  if (vatMatch) vat = parseFloat(vatMatch[1]);

  const totalMatch = fullText.match(
    /TOTAL\s*(?:AMOUNT)?\s*([0-9]+\.[0-9]{2})/i,
  );
  if (totalMatch) {
    totalAmount = parseFloat(totalMatch[1]);
  } else {
    const lastAmount = fullText.match(/(\d+\.\d{2})\s+THANK YOU/i);
    if (lastAmount) totalAmount = parseFloat(lastAmount[1]);
  }

  const reasonMatch = fullText.match(/PAYMENT REASON\s+(\w+)/i);
  if (reasonMatch) reason = reasonMatch[1];

  return {
    success: true,
    data: {
      payer,
      payerAccount,
      receiver,
      receiverAccount,
      amount,
      date,
      reference,
      reason,
      serviceCharge,
      vat,
      totalAmount,
    },
  };
}
export async function verifyMPesa(input: {
  reference?: string;
  fileBuffer?: Buffer;
  filePath?: string;
}): Promise<VerifyResult> {
  try {
    let reference = input.reference;

    if (input.fileBuffer || input.filePath) {
      let text = "";
      if (input.fileBuffer) {
        text = await extractTextFromPdfBuffer(input.fileBuffer);
      } else if (input.filePath) {
        const ext = path.extname(input.filePath).toLowerCase();
        if (ext === ".pdf") text = await extractTextFromPdf(input.filePath);
        else text = await extractTextFromImage(input.filePath);
      }

      const refFromFile = extractReference(text);
      if (!refFromFile && !reference) {
        return {
          success: false,
          error: "Transaction reference not found in file",
        };
      }

      reference = refFromFile || reference;
    }

    if (!reference) {
      return {
        success: false,
        error: "Transaction reference or file is required",
      };
    }

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
