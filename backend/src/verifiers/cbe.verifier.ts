import puppeteer, { Browser, HTTPResponse } from "puppeteer";
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

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function verifyCBE(payload: {
  pdfBuffer?: Buffer;
  reference?: string;
  accountSuffix?: string;
}): Promise<VerifyResult> {
  try {
    let pdfBuffer: Buffer;

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

    return await parseCBEReceipt(pdfBuffer);
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "CBE verification failed",
    };
  }
}

async function fetchCBEReceiptPdf(
  reference: string,
  accountSuffix: string,
): Promise<Buffer> {
  const fullId = `${reference.trim()}${accountSuffix.trim()}`;
  const url = `https://apps.cbe.com.et:100/?id=${fullId}`;

  let browser: Browser | null = null;
  let pdfResponse: HTTPResponse | null = null;
  let pdfUrl: string | null = null;

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
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
    );

    page.on("response", (response) => {
      const contentType = response.headers()["content-type"];
      if (contentType?.includes("application/pdf")) {
        pdfUrl = response.url();
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 25000,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    if (!pdfResponse) {
      throw new Error(
        "Receipt PDF not accessible. Reference may be invalid, expired, or blocked.",
      );
    }

    if (typeof pdfUrl !== "string") {
      throw new Error(
        "Receipt PDF not accessible. Reference may be invalid, expired, or blocked.",
      );
    }

    // ⬇️ TS now KNOWS this is string
    const download = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      httpsAgent,
    });

    if (!download.headers["content-type"]?.includes("pdf")) {
      throw new Error("Downloaded file is not a valid PDF");
    }

    return Buffer.from(download.data);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function parseCBEReceipt(buffer: Buffer): Promise<VerifyResult> {
  try {
    const pdfParse = require("pdf-parse");
    const pdf = await pdfParse(buffer);
    const text = pdf.text.replace(/\s+/g, " ").trim();

    const payer = text.match(/Payer\s*:?\s*(.*?)\s+Account/i)?.[1];
    const receiver = text.match(/Receiver\s*:?\s*(.*?)\s+Account/i)?.[1];

    const accounts = [
      ...text.matchAll(/Account\s*:?\s*([A-Z0-9]?\*{4}\d{4})/gi),
    ];

    const payerAccount = accounts[0]?.[1];
    const receiverAccount = accounts[1]?.[1];

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

    const parsedDate = new Date(dateText);
    if (isNaN(parsedDate.getTime())) {
      return { success: false, error: "Invalid date format in receipt" };
    }

    return {
      success: true,
      data: {
        payer: titleCase(payer),
        payerAccount,
        receiver: titleCase(receiver),
        receiverAccount,
        amount: parseFloat(amountText.replace(/,/g, "")),
        date: parsedDate,
        reference,
        reason: reason || null,
      },
    };
  } catch (err) {
    return { success: false, error: "PDF parsing failed" };
  }
}
