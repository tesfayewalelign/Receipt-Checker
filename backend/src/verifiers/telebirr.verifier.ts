import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import Tesseract from "tesseract.js";
import { VerifyResult } from "./cbe.verifier";
import logger from "../utils/logger";

puppeteer.use(StealthPlugin());

export interface TelebirrReceipt {
  reference: string;
  receiptNo: string;
  amount: number;
  totalPaid?: number;
  payer?: string;
  receiver?: string;
  status: string;
  date: Date;
}

export async function extractReferenceFromPdf(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i: any) => i.str).join(" ") + " ";
  }
  const match = text.match(/DB[A-Z0-9]+/i);
  if (!match) throw new Error("Reference not found in PDF");
  return normalizeReference(match[0]);
}

export async function extractReferenceFromImage(
  buffer: Buffer,
): Promise<string> {
  const result = await Tesseract.recognize(buffer, "eng");
  const cleaned = result.data.text
    .replace(/\s+/g, "")
    .replace(/0/g, "O")
    .replace(/1/g, "I");
  const match = cleaned.match(/[A-Z]{2}[A-Z0-9]{8,}/);
  if (!match) throw new Error("Reference not found in image");
  return normalizeReference(match[0]);
}

function normalizeReference(reference: string): string {
  return reference
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

export class TelebirrVerifier {
  private readonly BASE_URL = "https://transactioninfo.ethiotelecom.et/receipt";

  async verify(reference: string): Promise<TelebirrReceipt | null> {
    if (!reference) return null;

    const cleanedRef = normalizeReference(reference);

    logger.info(`Verifying Telebirr: ${cleanedRef}`);

    let html = await this.fetchReceiptViaProxy(cleanedRef);

    if (!html) {
      logger.warn("Proxy failed, trying Puppeteer");
      html = await this.fetchReceipt(cleanedRef);
    }

    if (!html) {
      logger.warn("Puppeteer failed, trying Axios");
      html = await this.fetchReceiptFallback(cleanedRef);
    }

    if (!html) {
      logger.warn("All fetch methods failed");
      return null;
    }

    const receipt = this.parseReceipt(html, cleanedRef);

    if (!receipt || !this.validateReceipt(receipt)) {
      logger.warn("Receipt validation failed");
      return null;
    }

    logger.info(`Telebirr verification SUCCESS: ${cleanedRef}`);

    return receipt;
  }

  private async fetchReceiptViaProxy(
    reference: string,
  ): Promise<string | null> {
    try {
      const url = process.env.TELEBIRR_PROXY_URL;
      const key = process.env.TELEBIRR_PROXY_KEY;

      if (!url || !key) {
        logger.warn("Proxy env missing");
        return null;
      }

      const response = await axios.post(
        url,
        { reference },
        {
          headers: {
            "x-api-key": key,
          },
          timeout: 30000,
        },
      );

      return response.data?.html ?? null;
    } catch (err: any) {
      logger.error("Proxy fetch failed:", err.message);
      return null;
    }
  }

  private async fetchReceipt(reference: string): Promise<string | null> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      );
      await page.goto(`${this.BASE_URL}/${reference}`, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });
      await page.waitForSelector("table", { timeout: 60000 });
      const html = await page.content();
      await browser.close();
      return html;
    } catch (err: any) {
      logger.error("Puppeteer fetch failed:", err.message);
      return null;
    }
  }

  private async fetchReceiptFallback(
    reference: string,
  ): Promise<string | null> {
    try {
      const res = await axios.get(`${this.BASE_URL}/${reference}`, {
        timeout: 30000,
      });
      if (res.status === 200 && res.data) return res.data;
      return null;
    } catch (err: any) {
      logger.error("Axios fallback fetch failed:", err.message);
      return null;
    }
  }

  private parseReceipt(
    html: string,
    reference: string,
  ): TelebirrReceipt | null {
    try {
      const $ = cheerio.load(html);
      const bodyText = $("body").text().replace(/\s+/g, " ");

      const amountMatch = bodyText.match(/([\d,]+\.\d{2})\s?(Birr|ETB)/i);
      const dateMatch = bodyText.match(/\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}:\d{2}/);
      const statusMatch = bodyText.match(
        /(success|successful|paid|complete|completed|failed|pending)/i,
      );

      const amount = amountMatch
        ? parseFloat(amountMatch[1].replace(/,/g, ""))
        : NaN;
      let date: Date | null = null;
      if (dateMatch) {
        const parts = dateMatch[0].split(/[- :]/);
        date = new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0]),
          Number(parts[3]),
          Number(parts[4]),
          Number(parts[5]),
        );
      }
      const status = statusMatch ? statusMatch[0] : undefined;
      if (!amount || isNaN(amount) || !date || !status) return null;

      return {
        reference,
        receiptNo: reference,
        amount,
        totalPaid: amount,
        status,
        date,
      };
    } catch {
      return null;
    }
  }

  private validateReceipt(receipt: TelebirrReceipt): boolean {
    if (
      !receipt.reference ||
      !receipt.amount ||
      receipt.amount <= 0 ||
      !receipt.date
    )
      return false;
    const validStatus = ["success", "paid", "complete"];
    return validStatus.some((word) =>
      receipt.status.toLowerCase().includes(word),
    );
  }
}

export async function verifyTelebirr(payload: {
  reference?: string;
  fileBuffer?: Buffer;
  fileType?: "pdf" | "image";
}): Promise<VerifyResult> {
  try {
    let reference = payload.reference;
    if (!reference && payload.fileBuffer) {
      reference =
        payload.fileType === "pdf"
          ? await extractReferenceFromPdf(payload.fileBuffer)
          : await extractReferenceFromImage(payload.fileBuffer);
    }
    if (!reference)
      throw new Error("Reference not provided or could not be extracted");

    const verifier = new TelebirrVerifier();
    const receipt = await verifier.verify(reference);
    if (!receipt) throw new Error("Telebirr verification failed");

    return {
      success: true,
      data: {
        payer: receipt.payer ?? "",
        payerAccount: "",
        receiver: receipt.receiver ?? "",
        receiverAccount: "",
        amount: receipt.amount,
        date: receipt.date,
        reference: receipt.reference,
        reason: undefined,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
