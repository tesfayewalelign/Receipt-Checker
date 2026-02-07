import puppeteer, { Browser, LaunchOptions, Page } from "puppeteer";

import axios, { AxiosResponse } from "axios";
import * as pdfParse from "pdf-parse";

import https from "https";
import logger from "../utils/logger";

export interface VerifyResult {
  success: boolean;
  payer?: string;
  payerAccount?: string;
  receiver?: string;
  receiverAccount?: string;
  amount?: number;
  date?: Date;
  reference?: string;
  reason?: string | null;
  error?: string;
}

function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
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
    const launchOptions: LaunchOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
      ],
      ...(process.env.PUPPETEER_EXECUTABLE_PATH
        ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
        : {}),
    };

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    let detectedPdfUrl: string | null = null;

    page.on("response", async (response) => {
      const contentType = response.headers()["content-type"];
      if (contentType?.includes("pdf")) detectedPdfUrl = response.url();
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await new Promise((res) => setTimeout(res, 3000));

    if (!detectedPdfUrl)
      return { success: false, error: "No PDF detected via Puppeteer." };

    const pdfRes = await axios.get(detectedPdfUrl, {
      httpsAgent,
      responseType: "arraybuffer",
    });

    return await parseCBEReceipt(pdfRes.data);
  } catch (puppetErr: any) {
    logger.error("❌ Puppeteer failed:", puppetErr.message);

    if (browser) await browser.close();

    return {
      success: false,
      error: `Both direct and Puppeteer failed: ${puppetErr.message}`,
    };
  }
}

async function parseCBEReceipt(buffer: ArrayBuffer): Promise<VerifyResult> {
  try {
    const pdfParse = require("pdf-parse");
    const parsed = await pdfParse(Buffer.from(buffer));

    const rawText = parsed.text.replace(/\s+/g, " ").trim();

    let payerName = rawText.match(/Payer\s*:?\s*(.*?)\s+Account/i)?.[1]?.trim();
    let receiverName = rawText
      .match(/Receiver\s*:?\s*(.*?)\s+Account/i)?.[1]
      ?.trim();
    const accountMatches = [
      ...rawText.matchAll(/Account\s*:?\s*([A-Z0-9]?\*{4}\d{4})/gi),
    ];
    const payerAccount = accountMatches?.[0]?.[1];
    const receiverAccount = accountMatches?.[1]?.[1];

    const reason = rawText
      .match(
        /Reason\s*\/\s*Type of service\s*:?\s*(.*?)\s+Transferred Amount/i,
      )?.[1]
      ?.trim();
    const amountText = rawText.match(
      /Transferred Amount\s*:?\s*([\d,]+\.\d{2})\s*ETB/i,
    )?.[1];
    const referenceMatch = rawText
      .match(/Reference No\.?\s*\(VAT Invoice No\)\s*:?\s*([A-Z0-9]+)/i)?.[1]
      ?.trim();
    const dateRaw = rawText
      .match(/Payment Date & Time\s*:?\s*([\d\/,: ]+[APM]{2})/i)?.[1]
      ?.trim();

    const amount = amountText
      ? parseFloat(amountText.replace(/,/g, ""))
      : undefined;
    const date = dateRaw ? new Date(dateRaw) : undefined;

    payerName = payerName ? titleCase(payerName) : undefined;
    receiverName = receiverName ? titleCase(receiverName) : undefined;

    if (
      payerName &&
      payerAccount &&
      receiverName &&
      receiverAccount &&
      amount &&
      date &&
      referenceMatch
    ) {
      return {
        success: true,
        payer: payerName,
        payerAccount,
        receiver: receiverName,
        receiverAccount,
        amount,
        date,
        reference: referenceMatch,
        reason: reason || null,
      };
    } else {
      return {
        success: false,
        error: "Could not extract all required fields from PDF.",
      };
    }
  } catch (parseErr: any) {
    logger.error("❌ PDF parsing failed:", parseErr.message);
    return { success: false, error: "Error parsing PDF data" };
  }
}
