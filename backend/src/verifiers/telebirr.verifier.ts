import axios from "axios";
import * as cheerio from "cheerio";
import logger from "../utils/logger";
import { VerifyResult } from "./cbe.verifier";

export interface TelebirrReceipt {
  reference: string;
  receiptNo: string;
  amount: number;
  serviceFee?: number;
  vat?: number;
  totalPaid?: number;
  payer?: string;
  receiver?: string;
  status: string;
  date: string;
}

export class TelebirrVerifier {
  private readonly BASE_URL = "https://transactioninfo.ethiotelecom.et/receipt";

  async verify(reference: string): Promise<TelebirrReceipt | null> {
    try {
      logger.info(`Starting Telebirr verification for reference: ${reference}`);

      const html = await this.fetchReceipt(reference);
      if (!html) {
        logger.warn(`Failed to fetch receipt HTML for reference: ${reference}`);
        return null;
      }
      logger.debug("Fetched Telebirr HTML:", html.slice(0, 1000));

      if (html.includes("This request is not correct")) {
        logger.warn(`Invalid reference or blocked request: ${reference}`);
        return null;
      }

      const parsed = this.parseReceipt(html, reference);
      if (!parsed) {
        logger.warn(`Failed to parse receipt data for reference: ${reference}`);
        return null;
      }
      logger.debug("Parsed Telebirr receipt:", parsed);

      if (!this.validateReceipt(parsed)) {
        logger.warn(`Receipt validation failed for reference: ${reference}`);
        return null;
      }

      logger.info(`Telebirr verification SUCCESS for reference: ${reference}`);
      return parsed;
    } catch (error: any) {
      logger.error(
        `Telebirr verification error for reference ${reference}:`,
        error.message,
      );
      return null;
    }
  }

  private async fetchReceipt(reference: string): Promise<string | null> {
    try {
      const url = `${this.BASE_URL}/${reference}`;
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          Referer: "https://transactioninfo.ethiotelecom.et/",
          Connection: "keep-alive",
        },
      });
      return response.data;
    } catch (error: any) {
      logger.warn(
        `Failed to fetch Telebirr receipt for ${reference}: ${error.message}`,
      );
      return null;
    }
  }

  private parseReceipt(
    html: string,
    reference: string,
  ): TelebirrReceipt | null {
    try {
      const $ = cheerio.load(html);

      const getText = (label: string): string | undefined => {
        const regex = new RegExp(`${label}\\s*:?\\s*([^<\\n]+)`, "i");
        const match = html.match(regex);
        if (match) return match[1].trim();

        const td = $(`td:contains('${label}')`).next();
        if (td) return td.text().trim();

        return undefined;
      };

      const amountStr = getText("Amount");
      const status = getText("Status");
      const receiptNo = getText("Receipt No") || getText("Receipt");
      const date = getText("Date");
      const payer = getText("Payer Name");
      const receiver = getText("Credited Party name");

      if (!amountStr || !status || !receiptNo || !date) return null;

      const amount = parseFloat(amountStr.replace(/[^\d.]/g, ""));
      if (isNaN(amount)) return null;

      return {
        reference,
        receiptNo,
        amount,
        status,
        date,
        payer,
        receiver,
      };
    } catch (error: any) {
      logger.error("Error parsing Telebirr receipt HTML:", error.message);
      return null;
    }
  }

  private validateReceipt(receipt: TelebirrReceipt): boolean {
    if (!receipt.reference) {
      logger.warn("Validation failed: missing reference");
      return false;
    }
    if (!receipt.amount || receipt.amount <= 0) {
      logger.warn("Validation failed: invalid amount");
      return false;
    }
    if (!receipt.status || !/SUCCESS|PAID|COMPLETED/i.test(receipt.status)) {
      logger.warn(
        `Validation failed: status is not successful (${receipt.status})`,
      );
      return false;
    }
    if (!receipt.date) {
      logger.warn("Validation failed: missing date");
      return false;
    }
    if (!receipt.receiptNo) {
      logger.warn("Validation failed: missing receipt number");
      return false;
    }
    return true;
  }
}

export async function verifyTelebirr(reference: string): Promise<VerifyResult> {
  const verifier = new TelebirrVerifier();
  const receipt = await verifier.verify(reference);

  if (!receipt) {
    logger.error(`Telebirr verification failed for reference: ${reference}`);
    return {
      success: false,
      error: "Telebirr verification failed",
    };
  }

  logger.info(`Telebirr verification completed for reference: ${reference}`);
  return {
    success: true,
    data: {
      payer: receipt.payer || "",
      payerAccount: "",
      receiver: receipt.receiver || "",
      receiverAccount: "",
      amount: receipt.amount,
      date: new Date(receipt.date),
      reference: receipt.reference,
      reason: undefined,
    },
  };
}
