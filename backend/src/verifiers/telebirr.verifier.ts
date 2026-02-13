import axios from "axios";
import cheerio from "cheerio";
import { VerifyResult } from "./cbe.verifier";

interface TelebirrReceipt {
  reference: string;
  payer?: string;
  amount: number;
  paymentMode: "telebirr";
  date: Date;
}

function buildTelebirrReceiptUrl(reference: string): string {
  return `https://telebirr.com/receipt?transactionNo=${reference}`;
}

export async function fetchTelebirrReceiptHtml(
  reference: string,
): Promise<string> {
  const url = buildTelebirrReceiptUrl(reference);

  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html",
    },
  });

  return response.data;
}

function parseTelebirrReceipt(html: string): TelebirrReceipt | null {
  const $ = cheerio.load(html);

  const reference = $("#transactionNo").text().trim();
  const amountText = $("#paidAmount").text().trim();
  const payer = $("#payerName").text().trim();
  const dateText = $("#paymentDate").text().trim();

  if (!reference || !amountText) {
    return null;
  }

  const amount = parseFloat(amountText.replace(/[^\d.]/g, ""));

  return {
    reference,
    payer: payer || undefined,
    amount,
    paymentMode: "telebirr",
    date: dateText ? new Date(dateText) : new Date(),
  };
}

export async function verifyTelebirr(payload: {
  reference?: string;
  pdfBuffer?: Buffer;
}): Promise<VerifyResult> {
  try {
    const { reference } = payload;

    if (!reference) {
      return {
        success: false,
        error: "Transaction number is required",
      };
    }

    const html = await fetchTelebirrReceiptHtml(reference);
    const receipt = parseTelebirrReceipt(html);

    if (!receipt) {
      return {
        success: false,
        error: "Telebirr receipt not found or invalid",
      };
    }

    return {
      success: true,
      data: {
        payer: receipt.payer || "N/A",
        payerAccount: "N/A",
        receiver: "Telebirr",
        receiverAccount: "N/A",
        amount: receipt.amount,
        date: receipt.date,
        reference: receipt.reference,
        reason: "Telebirr Payment",
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Telebirr verification failed",
    };
  }
}
