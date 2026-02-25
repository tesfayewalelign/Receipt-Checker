import axios, { AxiosResponse } from "axios";
import https from "https";
import pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import logger from "../utils/logger";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export interface CBEBirrVerifyResult {
  success: boolean;
  customerName?: string | null;
  debitAccount?: string | null;
  creditAccount?: string | null;
  receiverName?: string | null;
  orderId?: string | null;
  transactionStatus?: string | null;
  reference?: string | null;
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

    const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer $`,
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 30000,
      httpsAgent,
    });

    if (response.status !== 200) {
      return {
        success: false,
        error: `Failed to fetch receipt: HTTP ${response.status}`,
      };
    }

    const buffer = Buffer.from(response.data);

    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    const text = fullText.replace(/\s+/g, " ").trim();

    const extract = (regex: RegExp): string | null =>
      text.match(regex)?.[1]?.trim() ?? null;
    const extractAmount = (regex: RegExp): number | null => {
      const match = text.match(regex);
      if (!match?.[1]) return null;
      const num = parseFloat(match[1].replace(/,/g, ""));
      return isNaN(num) ? null : num;
    };

    const receiptLine = text.match(
      /(CL[A-Z0-9]+)\s+([\d-]+\s+[\d:]+)\s+([\d,]+\.\d{2})/,
    );
    const receiptNumberParsed = receiptLine?.[1] ?? null;
    const transactionDate = receiptLine?.[2] ? new Date(receiptLine[2]) : null;
    const amount = receiptLine?.[3]
      ? parseFloat(receiptLine[3].replace(/,/g, ""))
      : null;

    const result: CBEBirrVerifyResult = {
      success: true,
      customerName: extract(/Customer\s*Name\s*:?\s*(.*?)\s+(?:Debit|Credit)/i),
      debitAccount: extract(/Debit\s*Account\s*:?\s*([A-Z0-9\-]+)/i),
      creditAccount: extract(/Credit\s*Account\s*:?\s*([A-Z0-9\-]+)/i),
      receiverName: extract(
        /Receiver\s*Name\s*:?\s*(.*?)\s+(?:Order|Reference)/i,
      ),
      orderId: extract(/Order\s*ID\s*:?\s*([A-Z0-9]+)/i),
      transactionStatus: extract(/Transaction\s*Status\s*:?\s*(\w+)/i),
      reference: extract(/Reference\s*:?\s*([A-Z0-9\-]+)/i),
      receiptNumber: receiptNumberParsed,
      transactionDate,
      amount,
      paidAmount: extractAmount(
        /Paid\s*Amount\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      serviceCharge: extractAmount(
        /Service\s*Charge\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      vat: extractAmount(/VAT\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i),
      totalPaidAmount: extractAmount(
        /Total\s*Paid\s*Amount\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      paymentReason: extract(
        /Payment\s*Reason\s*:?\s*(.*?)\s+(?:Channel|Status)/i,
      ),
      paymentChannel: extract(/Payment\s*Channel\s*:?\s*(\w+)/i),
    };

    if (!result.receiptNumber && !result.amount) {
      return { success: false, error: "Failed to parse receipt data" };
    }

    return result;
  } catch (err: any) {
    logger.error("❌ [CBEBirr] Verification failed:", err.message);
    return { success: false, error: err.message || "Verification failed" };
  }
}
