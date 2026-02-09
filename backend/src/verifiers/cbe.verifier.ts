import puppeteer, { Browser } from "puppeteer";
import axios from "axios";
import https from "https";
import pdfParse from "pdf-parse";

export enum BankType {
  CBE = "CBE",
  TELEBIRR = "TELEBIRR",
  DASHEN = "DASHEN",
}

export interface VerifyResult {
  success: boolean;
  data?: {
    payer: string;
    payerAccount: string;
    receiver: string;
    receiverAccount: string;
    amount: number;
    date: Date;
    reference: string;
    reason?: string | null;
  };
  error?: string;
}

const titleCase = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export async function verifyByBank(
  bank: BankType,
  reference: string,
  accountSuffix: string,
): Promise<VerifyResult> {
  switch (bank) {
    case BankType.CBE:
      return await verifyCBE(reference, accountSuffix);
    case BankType.TELEBIRR:
      return {
        success: false,
        error: "TeleBirr verification not implemented yet",
      };
    case BankType.DASHEN:
      return {
        success: false,
        error: "Dashen verification not implemented yet",
      };
    default:
      return { success: false, error: "Unsupported bank" };
  }
}

export async function verifyCBE(
  reference: string,
  accountSuffix: string,
): Promise<VerifyResult> {
  const fullId = `${reference}${accountSuffix}`;
  const url = `https://apps.cbe.com.et:100/?id=${fullId}`;
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

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

    let detectedPdfUrl: string | null = null;
    page.on("response", (response) => {
      const contentType = response.headers()["content-type"];
      if (contentType?.includes("pdf")) detectedPdfUrl = response.url();
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await (page as any).waitForTimeout(3000); // wait for PDF to load

    if (!detectedPdfUrl) {
      return {
        success: false,
        error: "Receipt PDF not found (invalid reference)",
      };
    }

    const pdfResponse = await axios.get(detectedPdfUrl, {
      responseType: "arraybuffer",
      httpsAgent,
    });

    return parseCBEReceipt(Buffer.from(pdfResponse.data));
  } catch (err: any) {
    return { success: false, error: err.message || "CBE verification failed" };
  } finally {
    if (browser) await browser.close();
  }
}

async function parseCBEReceipt(buffer: Buffer): Promise<VerifyResult> {
  try {
    const pdfParse = require("pdf-parse");
    const parsed = await pdfParse(buffer);
    const text = parsed.text.replace(/\s+/g, " ").trim();

    const payer = text.match(/Payer\s*:?\s*(.*?)\s+Account/i)?.[1];
    const receiver = text.match(/Receiver\s*:?\s*(.*?)\s+Account/i)?.[1];

    const accounts = [
      ...text.matchAll(/Account\s*:?\s*([A-Z0-9]?\*{4}\d{4})/gi),
    ];
    const payerAccount = accounts?.[0]?.[1];
    const receiverAccount = accounts?.[1]?.[1];

    const amountText = text.match(
      /Transferred Amount\s*:?\s*([\d,]+\.\d{2})\s*ETB/i,
    )?.[1];
    const reference = text.match(
      /Reference No\.?\s*\(VAT Invoice No\)\s*:?\s*([A-Z0-9]+)/i,
    )?.[1];
    const dateText = text.match(
      /Payment Date & Time\s*:?\s*([\d\/,: ]+[APM]{2})/i,
    )?.[1];
    const reason = text.match(
      /Reason\s*\/\s*Type of service\s*:?\s*(.*?)\s+Transferred Amount/i,
    )?.[1];

    if (
      !payer ||
      !receiver ||
      !payerAccount ||
      !receiverAccount ||
      !amountText ||
      !reference ||
      !dateText
    ) {
      return {
        success: false,
        error: "Failed to extract required fields from CBE receipt",
      };
    }

    return {
      success: true,
      data: {
        payer: titleCase(payer),
        payerAccount,
        receiver: titleCase(receiver),
        receiverAccount,
        amount: parseFloat(amountText.replace(/,/g, "")),
        date: new Date(dateText),
        reference,
        reason: reason || null,
      },
    };
  } catch {
    return { success: false, error: "PDF parsing failed" };
  }
}
