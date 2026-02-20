import axios from "axios";
import * as cheerio from "cheerio";
import logger from "../utils/logger";
import { VerifyResult } from "./cbe.verifier";
import Tesseract from "tesseract.js";

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

async function extractReferenceFromPdfBuffer(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => i.str).join(" ") + " ";
  }
  // Match Telebirr reference pattern (adjust regex if needed)
  const match = fullText.match(/DB[A-Z0-9]{8}/i);
  if (!match) throw new Error("Reference not found in PDF");
  return match[0].toUpperCase();
}

async function extractReferenceFromImage(buffer: Buffer): Promise<string> {
  const result = await Tesseract.recognize(buffer, "eng");
  const text = result.data.text;
  const match = text.match(/DB[A-Z0-9]{8}/i); // Telebirr reference pattern
  if (!match) throw new Error("Reference not found in image");
  return match[0].toUpperCase();
}

export class TelebirrVerifier {
  private readonly BASE_URL = "https://transactioninfo.ethiotelecom.et/receipt";

  async verify(reference: string): Promise<TelebirrReceipt | null> {
    try {
      logger.info(`Telebirr verification started: ${reference}`);

      const html = await this.fetchReceipt(reference);
      if (!html) return null;

      if (html.includes("This request is not correct")) {
        logger.warn("Invalid Telebirr reference");
        return null;
      }

      const parsed = this.parseReceipt(html, reference);
      if (!parsed) return null;

      if (!this.validateReceipt(parsed)) return null;

      logger.info(`Telebirr verification SUCCESS: ${reference}`);
      return parsed;
    } catch (error: any) {
      logger.error("Telebirr verification error:", error.message);
      return null;
    }
  }

  private async fetchReceipt(reference: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.BASE_URL}/${reference}`, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error("Failed to fetch Telebirr receipt:", error.message);
      return null;
    }
  }

  private parseReceipt(
    html: string,
    reference: string,
  ): TelebirrReceipt | null {
    try {
      const $ = cheerio.load(html);

      let payer: string | undefined;
      $("td").each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes("Payer Name")) {
          payer = $(el).next("td").text().trim();
        }
      });

      let receiver: string | undefined;
      $("td").each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes("Credited Party name")) {
          receiver = $(el).next("td").text().trim();
        }
      });

      let status: string | undefined;
      $("td").each((_, el) => {
        const text = $(el).text().trim();
        if (text.toLowerCase().includes("transaction status")) {
          status = $(el).next("td").text().trim();
        }
      });

      let receiptNo: string | undefined;
      let dateStr: string | undefined;
      let amountStr: string | undefined;

      $("table").each((_, table) => {
        const rows = $(table).find("tr");
        rows.each((i, row) => {
          const cols = $(row).find("td");

          if (cols.length >= 3) {
            const invoice = $(cols[0]).text().trim();
            const date = $(cols[1]).text().trim();
            const amount = $(cols[2]).text().trim();

            if (invoice && date && amount && invoice === reference) {
              receiptNo = invoice;
              dateStr = date;
              amountStr = amount;
            }
          }
        });
      });

      if (!receiptNo || !dateStr || !amountStr || !status) {
        logger.warn("Missing required Telebirr fields");
        return null;
      }

      const amount = parseFloat(amountStr.replace(/[^\d.]/g, ""));

      if (isNaN(amount)) return null;

      const [day, month, yearTime] = dateStr.split("-");
      const [year, time] = yearTime.split(" ");
      const formattedDate = new Date(`${year}-${month}-${day}T${time}`);

      if (isNaN(formattedDate.getTime())) {
        logger.warn("Invalid date format:", dateStr);
        return null;
      }

      return {
        reference,
        receiptNo,
        amount,
        totalPaid: amount,
        payer,
        receiver,
        status,
        date: formattedDate,
      };
    } catch (error: any) {
      logger.error("Telebirr parse error:", error.message);
      return null;
    }
  }

  private validateReceipt(receipt: TelebirrReceipt): boolean {
    if (!receipt.reference) return false;
    if (!receipt.amount || receipt.amount <= 0) return false;

    const validStatus = ["success", "paid", "complete"];
    const statusOk = validStatus.some((word) =>
      receipt.status.toLowerCase().includes(word),
    );

    if (!statusOk) {
      logger.warn("Invalid Telebirr status:", receipt.status);
      return false;
    }

    if (!receipt.receiptNo) return false;
    if (!receipt.date) return false;

    return true;
  }
}

export async function verifyTelebirr(reference: string): Promise<VerifyResult> {
  const verifier = new TelebirrVerifier();
  const receipt = await verifier.verify(reference);

  if (!receipt) {
    return {
      success: false,
      error: "Telebirr verification failed",
    };
  }

  return {
    success: true,
    data: {
      payer: receipt.payer || "",
      payerAccount: "",
      receiver: receipt.receiver || "",
      receiverAccount: "",
      amount: receipt.amount,
      date: receipt.date,
      reference: receipt.reference,
      reason: undefined,
    },
  };
}
