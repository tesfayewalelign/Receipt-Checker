import axios, { AxiosResponse } from "axios";
import https from "https";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import logger from "../utils/logger";

// Disable worker for Node.js
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = undefined;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface CBEBirrVerifyResult {
  success: boolean;
  customerName?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  receiverName?: string | null;
  orderId?: string | null;
  transactionStatus?: string | null;
  receiptNumber?: string | null;
  transactionDate?: Date | null;
  amount?: number | null;
  paidAmount?: number | null;
  serviceCharge?: number | null;
  vat?: number | null;
  totalPaidAmount?: number | null;
  paymentReason?: string | null;
  paymentChannel?: string | null;
  error?: string;
}

export async function verifyCBEBirr(input: {
  receiptNumber: string;
  phoneNumber: string;
  apiKey: string;
}): Promise<CBEBirrVerifyResult> {
  try {
    const { receiptNumber, phoneNumber } = input;

    if (!receiptNumber || !phoneNumber) {
      return {
        success: false,
        error: "Receipt number and phone number are required",
      };
    }

    const url = `https://cbepay1.cbe.com.et/aureceipt?TID=${receiptNumber}&PH=${phoneNumber}`;
    logger.info(`🔎 [CBEBirr] Fetching receipt: ${receiptNumber}`);

    // Fetch PDF
    const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      httpsAgent,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.data) {
      return { success: false, error: "Empty response from CBE server" };
    }

    if (!response.headers["content-type"]?.includes("pdf")) {
      return {
        success: false,
        error: "Response is not a valid PDF file",
      };
    }

    // Convert to Uint8Array (REQUIRED by pdfjs)
    const uint8Array = new Uint8Array(response.data);

    const pdf = await pdfjsLib.getDocument({
      data: uint8Array,
    }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    const text = fullText.replace(/\s+/g, " ").trim();

    // Helper functions
    const extract = (regex: RegExp): string | null =>
      text.match(regex)?.[1]?.trim() ?? null;

    const extractAmount = (regex: RegExp): number | null => {
      const match = text.match(regex);
      if (!match?.[1]) return null;
      const num = parseFloat(match[1].replace(/,/g, ""));
      return isNaN(num) ? null : num;
    };

    // ===== Extract Fields Based On Real Receipt Format =====

    // ===== Extract fields safely first =====

    // Receipt Number
    const receiptNumberParsed = extract(/(CL[A-Z0-9]+)/i);

    // Transaction Date
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}/);
    const transactionDateParsed = dateMatch ? new Date(dateMatch[0]) : null;

    // Amounts
    const allAmounts = [...text.matchAll(/(\d+\.\d{2})/g)].map((m) =>
      parseFloat(m[1]),
    );
    const amountParsed = allAmounts.length > 0 ? allAmounts[0] : null;

    // Financial breakdowns using keyword extraction
    const extractAfterKeyword = (keyword: string): number | null => {
      const regex = new RegExp(keyword + "\\s*(\\d+\\.\\d{2})", "i");
      const match = text.match(regex);
      return match ? parseFloat(match[1]) : null;
    };

    const paidAmountParsed = extractAfterKeyword("Paid amount");
    const serviceChargeParsed = extractAfterKeyword("Service Charge");
    const vatParsed = extractAfterKeyword("VAT");
    const totalPaidAmountParsed =
      extractAfterKeyword("Total Paid Amount") ??
      (allAmounts.length > 0 ? Math.max(...allAmounts) : null);

    // Other fields
    const customerNameParsed = extract(
      /Debit\s*Account\s*\d+\s*-\s*(.*?)\s+Credit/i,
    );
    const debitAccountParsed = extract(/Debit\s*Account\s*([0-9]+)/i);
    const creditAccountParsed = extract(/Credit\s*Account\s*([0-9\*]+)/i);
    const receiverNameParsed = extract(/Receiver\s*Name\s*(.*?)\s+Order/i);
    const orderIdParsed = extract(/Order\s*ID\s*([A-Z0-9]+)/i);
    const transactionStatusParsed = extract(/Transaction\s*Status\s*(\w+)/i);
    const paymentReasonParsed = extract(
      /Payment\s*Reason\s*(.*?)\s+Payment\s*Channel/i,
    );
    const paymentChannelParsed = extract(/Payment\s*Channel\s*(\w+)/i);

    // ===== Now build the result object =====
    const result: CBEBirrVerifyResult = {
      success: true,
      customerName: customerNameParsed,
      debitAccount: debitAccountParsed,
      creditAccount: creditAccountParsed,
      receiverName: receiverNameParsed,
      orderId: orderIdParsed,
      transactionStatus: transactionStatusParsed,
      receiptNumber: receiptNumberParsed,
      transactionDate: transactionDateParsed,
      amount: amountParsed,
      paidAmount: paidAmountParsed,
      serviceCharge: serviceChargeParsed,
      vat: vatParsed,
      totalPaidAmount: totalPaidAmountParsed,
      paymentReason: paymentReasonParsed,
      paymentChannel: paymentChannelParsed,
    };

    return result;
  } catch (err: any) {
    logger.error("❌ [CBEBirr] Verification failed:", err.message);
    return {
      success: false,
      error: err.message || "Verification failed",
    };
  }
}
