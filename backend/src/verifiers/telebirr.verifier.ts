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
  return `https://transactioninfo.ethiotelecom.et/receipt/${reference}`;
}

async function fetchTelebirrReceiptHtml(reference: string): Promise<string> {
  const url = buildTelebirrReceiptUrl(reference);

  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    validateStatus: (status) => status < 500,
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch Telebirr receipt");
  }

  return response.data;
}

function extractWithRegex(html: string, label: string): string | null {
  const regex = new RegExp(`${label}.*?(\\d+(\\.\\d{2})?)`, "i");
  const match = html.match(regex);
  return match ? match[1] : null;
}

function parseTelebirrReceipt(
  html: string,
  requestedReference: string,
): TelebirrReceipt | null {
  if (!html.toLowerCase().includes("telebirr")) {
    return null;
  }

  const $ = cheerio.load(html);

  const reference =
    $('td:contains("Transaction")').next().text().trim() || requestedReference;

  const amountText =
    $('td:contains("Amount")').next().text().trim() ||
    extractWithRegex(html, "Amount");

  const payer = $('td:contains("Payer")').next().text().trim() || undefined;

  const dateText = $('td:contains("Date")').next().text().trim() || undefined;

  if (!reference || !amountText) {
    return null;
  }

  const amount = parseFloat(amountText.replace(/[^\d.]/g, ""));

  if (!amount || amount <= 0) {
    return null;
  }

  return {
    reference,
    payer,
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
    console.log(html);
    const receipt = parseTelebirrReceipt(html, reference);

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
