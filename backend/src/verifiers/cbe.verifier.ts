import puppeteer, { Browser, HTTPResponse } from "puppeteer";
import axios from "axios";
import https from "https";

import pdfParseCJS from "pdf-parse";
const pdfParse = pdfParseCJS as unknown as (
  buffer: Buffer,
) => Promise<{ text: string }>;

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

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function verifyCBE(payload: {
  pdfBuffer?: Buffer;
  reference?: string;
  accountSuffix?: string;
}): Promise<VerifyResult> {
  try {
    let pdfBuffer: Buffer;

    if (payload.pdfBuffer) {
      pdfBuffer = payload.pdfBuffer;
      console.log("✅ Using provided PDF buffer");
    } else if (payload.reference && payload.accountSuffix) {
      console.log("🔄 Fetching PDF from CBE website...");
      pdfBuffer = await fetchCBEReceiptPdf(
        payload.reference,
        payload.accountSuffix,
      );
    } else {
      return { success: false, error: "No PDF or reference provided" };
    }

    return await parseCBEReceipt(pdfBuffer);
  } catch (err: any) {
    console.error("❌ Verification failed:", err.message);
    return { success: false, error: err?.message || "CBE verification failed" };
  }
}

async function fetchCBEReceiptPdf(
  reference: string,
  accountSuffix: string,
): Promise<Buffer> {
  const fullId = `${reference.trim()}${accountSuffix.trim()}`;
  const url = `https://apps.cbe.com.et:100/?id=${fullId}`;

  let browser: Browser | null = null;
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

    page.on("response", (response: HTTPResponse) => {
      const ct = response.headers()["content-type"];
      if (ct && ct.includes("application/pdf")) {
        pdfUrl = response.url();
        console.log("📄 PDF found:", pdfUrl);
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 25000 });

    if (!pdfUrl) {
      throw new Error(
        "Receipt PDF not accessible. Reference may be invalid or expired.",
      );
    }

    const download = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      httpsAgent,
      timeout: 30000,
    });

    console.log("Download headers:", download.headers);
    console.log("Downloaded bytes:", download.data.byteLength);

    if (!download.headers["content-type"]?.includes("pdf")) {
      throw new Error("Downloaded file is not a valid PDF");
    }

    return Buffer.from(download.data);
  } finally {
    if (browser) await browser.close();
  }
}

export async function parseCBEReceipt(
  buffer: Buffer | ArrayBuffer,
): Promise<VerifyResult> {
  try {
    const pdfBuffer =
      buffer instanceof ArrayBuffer ? Buffer.from(buffer) : buffer;

    const parsed = await pdfParse(pdfBuffer);

    const rawText = parsed.text
      .replace(/\r\n/g, "\n")
      .replace(/\s+/g, " ")
      .trim();
    console.log("PDF snippet (first 500 chars):\n", rawText.slice(0, 500));

    const payerMatch = rawText.match(
      /Payer\s*:\s*(.*?)\s+Account\s*:\s*([A-Z0-9*]+)/i,
    );
    const receiverMatch = rawText.match(
      /Receiver\s*:\s*(.*?)\s+Account\s*:\s*([A-Z0-9*]+)/i,
    );

    const payerName = payerMatch?.[1]?.trim();
    const payerAccount = payerMatch?.[2]?.trim();
    const receiverName = receiverMatch?.[1]?.trim();
    const receiverAccount = receiverMatch?.[2]?.trim();

    const reference = rawText
      .match(/Reference No\.?\s*\(VAT Invoice No\)\s*:\s*([A-Z0-9]+)/i)?.[1]
      ?.trim();
    const reason = rawText
      .match(
        /Reason\s*\/\s*Type of service\s*:\s*(.*?)\s+Transferred Amount/i,
      )?.[1]
      ?.trim();
    const amountText = rawText
      .match(/Transferred Amount\s*:\s*([\d,]+\.\d{2})\s*ETB/i)?.[1]
      ?.trim();
    const dateText = rawText
      .match(/Payment Date & Time\s*:\s*([\d\/,: ]+[APM]{2})/i)?.[1]
      ?.trim();

    const amount = amountText
      ? parseFloat(amountText.replace(/,/g, ""))
      : undefined;
    const date = dateText ? new Date(dateText) : undefined;

    if (
      payerName &&
      payerAccount &&
      receiverName &&
      receiverAccount &&
      amount &&
      date &&
      reference
    ) {
      return {
        success: true,
        data: {
          payer: titleCase(payerName),
          payerAccount,
          receiver: titleCase(receiverName),
          receiverAccount,
          amount,
          date,
          reference,
          reason: reason || null,
        },
      };
    } else {
      console.error(
        "❌ Could not extract all fields. PDF snippet:\n",
        rawText.slice(0, 1000),
      );
      return {
        success: false,
        error: "Could not extract all required fields from PDF.",
      };
    }
  } catch (err: any) {
    console.error("❌ PDF parsing failed:", err.message);
    return { success: false, error: "Error parsing PDF data" };
  }
}
