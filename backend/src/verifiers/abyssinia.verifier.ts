import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";
import path from "path";
import puppeteer, { Browser, Page, HTTPResponse } from "puppeteer";

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
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => i.str).join(" ") + " ";
  }
  return clean(fullText);
}

export async function fetchSlipPdf(
  reference: string,
  accountSuffix: string,
): Promise<Buffer> {
  const url = `https://cs.bankofabyssinia.com/slip/?trx=${reference}${accountSuffix}`;
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page: Page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const pdfBuffer: Buffer = await new Promise(async (resolve, reject) => {
      browser!.once("targetcreated", async (target) => {
        try {
          const newPage = await target.page();
          if (!newPage) return reject("Failed to open PDF page");

          await new Promise((r) => setTimeout(r, 1000));

          const response: HTTPResponse | null = await newPage.goto(
            newPage.url(),
          );
          if (!response) return reject("Failed to load PDF page");

          const buffer = await response.buffer();
          resolve(buffer);
        } catch (err) {
          reject(err);
        }
      });

      const clicked = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll("button")).find((b) =>
          b.textContent?.includes("Download PDF"),
        );
        if (!btn) return false;
        (btn as HTMLButtonElement).click();
        return true;
      });

      if (!clicked) reject("Download PDF button not found");
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
}
function parseSlip(text: string): VerifyResult {
  if (!text || text.length < 30) {
    return {
      success: false,
      error: "Slip PDF returned empty or invalid content",
    };
  }

  const reference = extractReference(text);

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
      date: transactionDateRaw ? new Date(transactionDateRaw.trim()) : null,
      reference: reference,
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
}): Promise<VerifyResult> {
  try {
    let finalReference = input.reference;
    const accountSuffix = input.accountSuffix;

    if (!accountSuffix && !input.filePath)
      return {
        success: false,
        error: "Account suffix is required if no filePath provided",
      };

    let pdfBuffer: Buffer;

    if (input.filePath) {
      if (!fs.existsSync(input.filePath)) {
        return { success: false, error: "File path does not exist" };
      }
      pdfBuffer = fs.readFileSync(input.filePath);
    } else {
      if (!finalReference)
        return { success: false, error: "Transaction reference is required" };
      pdfBuffer = await fetchSlipPdf(finalReference, accountSuffix!);
    }

    const pdfText = await extractTextFromPdfBuffer(pdfBuffer);
    console.log("SLIP PDF TEXT:", pdfText);

    return parseSlip(pdfText);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Abyssinia verification failed",
    };
  }
}
