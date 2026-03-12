import axios from "axios";
import https from "https";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import fs from "fs";
import logger from "../utils/logger";

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

async function extractReceiptFromPDF(
  filePath: string,
): Promise<string | undefined> {
  const buffer = fs.readFileSync(filePath);

  const data = await (pdfParse as unknown as (buffer: Buffer) => Promise<any>)(
    buffer,
  );

  const match = data.text.match(/(CL[A-Z0-9]+)/i);

  return match?.[1];
}

async function extractReceiptFromImage(
  filePath: string,
): Promise<string | null> {
  const result = await Tesseract.recognize(filePath, "eng");

  const text = result.data.text;
  const match = text.match(/(CL[A-Z0-9]+)/i);

  return match ? match[1] : null;
}

export async function verifyCBEBirr(input: {
  receiptNumber?: string;
  phoneNumber: string;
  apiKey: string;
  filePath?: string;
}): Promise<CBEBirrVerifyResult> {
  try {
    let { receiptNumber, phoneNumber, filePath } = input;

    if (!phoneNumber) {
      return {
        success: false,
        error: "Phone number is required",
      };
    }

    if (!receiptNumber && filePath) {
      logger.info("[CBEBirr] Extracting receipt from file");

      if (filePath.endsWith(".pdf")) {
        receiptNumber = (await extractReceiptFromPDF(filePath)) ?? undefined;
      } else {
        receiptNumber = (await extractReceiptFromImage(filePath)) ?? undefined;
      }

      if (!receiptNumber) {
        return {
          success: false,
          error: "Could not extract receipt number from file",
        };
      }
    }

    if (!receiptNumber) {
      return {
        success: false,
        error: "Receipt number is required",
      };
    }

    const url = `https://cbepay1.cbe.com.et/aureceipt?TID=${receiptNumber}&PH=${phoneNumber}`;

    logger.info(`[CBEBirr] Fetching receipt ${receiptNumber}`);

    const response = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      httpsAgent,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.data) {
      return { success: false, error: "Empty response from CBE server" };
    }

    if (!response.headers["content-type"]?.includes("pdf")) {
      return { success: false, error: "Response is not a valid PDF" };
    }

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(response.data),
    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }

    text = text.replace(/\s+/g, " ").trim();

    const extract = (regex: RegExp): string | null =>
      text.match(regex)?.[1]?.trim() ?? null;

    const receiptNumberParsed = extract(/(CL[A-Z0-9]+)/i);

    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}/);
    const transactionDateParsed = dateMatch ? new Date(dateMatch[0]) : null;

    const allAmounts = [...text.matchAll(/(\d+\.\d{2})/g)].map((m) =>
      parseFloat(m[1]),
    );

    const amountParsed = allAmounts.length ? allAmounts[0] : null;

    const extractAfterKeyword = (keyword: string): number | null => {
      const match = text.match(
        new RegExp(`${keyword}\\s*(\\d+\\.\\d{2})`, "i"),
      );
      return match ? parseFloat(match[1]) : null;
    };

    const result: CBEBirrVerifyResult = {
      success: true,
      customerName: extract(/Debit\s*Account\s*\d+\s*-\s*(.*?)\s+Credit/i),
      debitAccount: extract(/Debit\s*Account\s*([0-9]+)/i),
      creditAccount: extract(/Credit\s*Account\s*([0-9\*]+)/i),
      receiverName: extract(/Receiver\s*Name\s*(.*?)\s+Order/i),
      orderId: extract(/Order\s*ID\s*([A-Z0-9]+)/i),
      transactionStatus: extract(/Transaction\s*Status\s*(\w+)/i),
      receiptNumber: receiptNumberParsed,
      transactionDate: transactionDateParsed,
      amount: amountParsed,
      paidAmount: extractAfterKeyword("Paid amount"),
      serviceCharge: extractAfterKeyword("Service Charge"),
      vat: extractAfterKeyword("VAT"),
      totalPaidAmount:
        extractAfterKeyword("Total Paid Amount") ??
        (allAmounts.length ? Math.max(...allAmounts) : null),
      paymentReason: extract(/Payment\s*Reason\s*(.*?)\s+Payment\s*Channel/i),
      paymentChannel: extract(/Payment\s*Channel\s*(\w+)/i),
    };

    return result;
  } catch (err: any) {
    logger.error("[CBEBirr] Verification failed:", err.message);

    return {
      success: false,
      error: err?.message || "Verification failed",
    };
  }
}
