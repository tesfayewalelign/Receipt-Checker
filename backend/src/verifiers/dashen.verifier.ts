import axios, { AxiosResponse } from "axios";
import pdf from "pdf-parse";
import https from "https";
import logger from "../utils/logger";

export interface DashenVerifyResult {
  success: boolean;
  senderName?: string | null;
  senderAccountNumber?: string | null;
  transactionChannel?: string | null;
  serviceType?: string | null;
  narrative?: string | null;
  receiverName?: string | null;
  phoneNo?: string | null;
  institutionName?: string | null;
  transactionReference?: string | null;
  transferReference?: string | null;
  transactionDate?: Date | null;
  transactionAmount?: number | null;
  serviceCharge?: number | null;
  exciseTax?: number | null;
  vat?: number | null;
  penaltyFee?: number | null;
  incomeTaxFee?: number | null;
  interestFee?: number | null;
  stampDuty?: number | null;
  discountAmount?: number | null;
  total?: number | null;
  error?: string;
}

function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function verifyDashen(
  transactionReference: string,
): Promise<DashenVerifyResult> {
  const url = `https://receipt.dashensuperapp.com/receipt/${transactionReference}`;
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });

  try {
    logger.info(`🔎 Fetching Dashen receipt: ${url}`);
    const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
      httpsAgent,
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/pdf",
      },
      timeout: 30000,
    });

    logger.info("✅ Dashen receipt fetched, parsing PDF...");
    return await parseDashenReceipt(response.data);
  } catch (err: any) {
    logger.error("❌ Dashen receipt fetch failed:", err.message);
    return {
      success: false,
      error: `Failed to fetch receipt: ${err.message}`,
    };
  }
}

async function parseDashenReceipt(
  buffer: ArrayBuffer,
): Promise<DashenVerifyResult> {
  try {
    const pdf = require("pdf-parse");

    const parsed = await pdf(Buffer.from(buffer));
    const rawText = parsed.text.replace(/\s+/g, " ").trim();

    const extract = (regex: RegExp): string | null => {
      const match = rawText.match(regex);
      return match?.[1]?.trim() ?? null;
    };

    const senderName = titleCase(
      extract(/Sender\s*Name\s*:?\s*(.*?)\s+(?:Sender\s*Account|Account)/i) ??
        "",
    );
    const senderAccountNumber = extract(
      /Sender\s*Account\s*(?:Number)?\s*:?\s*([A-Z0-9\*\-]+)/i,
    );
    const transactionChannel = extract(
      /Transaction\s*Channel\s*:?\s*(.*?)\s+(?:Service|Type)/i,
    );
    const serviceType = extract(
      /Service\s*Type\s*:?\s*(.*?)\s+(?:Narrative|Description)/i,
    );
    const narrative = extract(/Narrative\s*:?\s*(.*?)\s+(?:Receiver|Phone)/i);
    const receiverName = titleCase(
      extract(/Receiver\s*Name\s*:?\s*(.*?)\s+(?:Phone|Institution)/i) ?? "",
    );
    const phoneNo = extract(/Phone\s*(?:No\.?|Number)?\s*:?\s*([\+\d\-\s]+)/i);
    const institutionName = titleCase(
      extract(/Institution\s*Name\s*:?\s*(.*?)\s+(?:Transaction|Reference)/i) ??
        "",
    );
    const transactionRef = extract(
      /Transaction\s*Reference\s*:?\s*([A-Z0-9\-]+)/i,
    );
    const transferReference = extract(
      /Transfer\s*Reference\s*:?\s*([A-Z0-9\-]+)/i,
    );
    const dateRaw = extract(
      /Transaction\s*Date\s*(?:&\s*Time)?\s*:?\s*([\d\/\-,: ]+(?:[APM]{2})?)/i,
    );
    const transactionDate = dateRaw ? new Date(dateRaw) : null;

    const extractAmount = (regex: RegExp): number | null => {
      const m = rawText.match(regex);
      if (!m?.[1]) return null;
      const n = parseFloat(m[1].replace(/,/g, ""));
      return isNaN(n) ? null : n;
    };

    const transactionAmount = extractAmount(
      /Transaction\s*Amount\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const serviceCharge = extractAmount(
      /Service\s*Charge\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const exciseTax = extractAmount(
      /Excise\s*Tax\s*(?:\(15%\))?\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const vat = extractAmount(
      /VAT\s*(?:\(15%\))?\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const penaltyFee = extractAmount(
      /Penalty\s*Fee\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const incomeTaxFee = extractAmount(
      /Income\s*Tax\s*Fee\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const interestFee = extractAmount(
      /Interest\s*Fee\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const stampDuty = extractAmount(
      /Stamp\s*Duty\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const discountAmount = extractAmount(
      /Discount\s*Amount\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
    );
    const total = extractAmount(/Total\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i);

    return {
      success: true,
      senderName,
      senderAccountNumber,
      transactionChannel,
      serviceType,
      narrative,
      receiverName,
      phoneNo,
      institutionName,
      transactionReference: transactionRef,
      transferReference,
      transactionDate,
      transactionAmount,
      serviceCharge,
      exciseTax,
      vat,
      penaltyFee,
      incomeTaxFee,
      interestFee,
      stampDuty,
      discountAmount,
      total,
    };
  } catch (err: any) {
    logger.error("❌ Dashen PDF parsing failed:", err.message);
    return { success: false, error: "Failed to parse Dashen PDF" };
  }
}
