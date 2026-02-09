import puppeteer, { Browser } from "puppeteer";
import axios from "axios";
import https from "https";
import pdfParse from "pdf-parse";

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

export async function verifyCBE(payload: {
  pdfBuffer?: Buffer;
  reference?: string;
  accountSuffix?: string;
}): Promise<VerifyResult> {
  try {
    let pdfBuffer: Buffer | null = null;

    if (payload.pdfBuffer) {
      pdfBuffer = payload.pdfBuffer;
    } else if (payload.reference && payload.accountSuffix) {
      pdfBuffer = await fetchCBEReceiptPdf(
        payload.reference,
        payload.accountSuffix,
      );
    } else {
      return { success: false, error: "No PDF or reference provided" };
    }

    return parseCBEReceipt(pdfBuffer);
  } catch (err: any) {
    return { success: false, error: err.message || "CBE verification failed" };
  }
}

async function fetchCBEReceiptPdf(
  reference: string,
  suffix: string,
): Promise<Buffer> {
  const fullId = `${reference}${suffix}`;
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

    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

    await new Promise((r) => setTimeout(r, 3000));

    if (!detectedPdfUrl)
      throw new Error("Receipt PDF not found (invalid reference)");

    const pdfResponse = await axios.get(detectedPdfUrl, {
      responseType: "arraybuffer",
      httpsAgent,
    });

    return Buffer.from(pdfResponse.data);
  } finally {
    if (browser) await browser.close();
  }
}

function parseCBEReceipt(buffer: Buffer): VerifyResult {
  try {
    const pdfParse = require("pdf-parse");
    const parsed = pdfParse(buffer);
    return parsed.then((pdf: any) => {
      const text = pdf.text.replace(/\s+/g, " ").trim();

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
    });
  } catch {
    return { success: false, error: "PDF parsing failed" };
  }
}
