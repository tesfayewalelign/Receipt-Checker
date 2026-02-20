import fs from "fs";
import path from "path";
import axios, { AxiosResponse } from "axios";
import https from "https";
import Tesseract from "tesseract.js";
import logger from "../utils/logger";

const pdfParse = require("pdf-parse");

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

async function extractTransactionReference(
  fileBuffer: Buffer,
  fileType: "pdf" | "image",
): Promise<string | null> {
  try {
    let text = "";

    if (fileType === "pdf") {
      const parsed = await pdfParse(fileBuffer);
      text = parsed.text;
    } else {
      const result = await Tesseract.recognize(fileBuffer, "eng");
      text = result.data.text;
    }

    const match = text.match(/[A-Z0-9]{10,}/i);
    return match ? match[0].toUpperCase() : null;
  } catch (err: any) {
    logger.error("❌ Failed to extract transaction reference:", err.message);
    return null;
  }
}

export async function verifyDashen(input: {
  reference?: string;
  filePath?: string;
  fileBuffer?: Buffer;
  fileType?: "pdf" | "image";
}): Promise<DashenVerifyResult> {
  try {
    let transactionReference: string | null = null;

    if (input.reference) {
      transactionReference = input.reference.trim().toUpperCase();
    } else if (input.fileBuffer || input.filePath) {
      let buffer: Buffer;
      let type: "pdf" | "image";

      if (input.fileBuffer) {
        buffer = input.fileBuffer;
        type = input.fileType || "pdf";
      } else {
        if (!fs.existsSync(input.filePath!)) {
          return { success: false, error: "File path does not exist" };
        }

        buffer = fs.readFileSync(input.filePath!);
        type =
          path.extname(input.filePath!).toLowerCase() === ".pdf"
            ? "pdf"
            : "image";
      }

      transactionReference = await extractTransactionReference(buffer, type);
    }

    if (!transactionReference) {
      return {
        success: false,
        error: "Reference or file is required",
      };
    }

    const url = `https://receipt.dashensuperapp.com/receipt/${transactionReference}`;
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    logger.info(`🔎 Fetching Dashen receipt: ${url}`);

    const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
      httpsAgent,
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/pdf",
      },
      timeout: 30000,
    });

    logger.info("✅ Dashen receipt fetched. Parsing PDF...");

    return await parseDashenReceipt(response.data);
  } catch (err: any) {
    logger.error("❌ Dashen verification failed:", err.message);
    return { success: false, error: err.message };
  }
}

async function parseDashenReceipt(
  buffer: ArrayBuffer,
): Promise<DashenVerifyResult> {
  try {
    const parsed = await pdfParse(Buffer.from(buffer));
    const rawText = parsed.text.replace(/\s+/g, " ").trim();

    const extract = (regex: RegExp): string | null => {
      const match = rawText.match(regex);
      return match?.[1]?.trim() ?? null;
    };

    const extractAmount = (regex: RegExp): number | null => {
      const match = rawText.match(regex);
      if (!match?.[1]) return null;
      const num = parseFloat(match[1].replace(/,/g, ""));
      return isNaN(num) ? null : num;
    };

    return {
      success: true,
      senderName: titleCase(
        extract(/Sender\s*Name\s*:?\s*(.*?)\s+(?:Sender\s*Account|Account)/i) ??
          "",
      ),
      senderAccountNumber: extract(
        /Sender\s*Account\s*(?:Number)?\s*:?\s*([A-Z0-9\*\-]+)/i,
      ),
      transactionChannel: extract(
        /Transaction\s*Channel\s*:?\s*(.*?)\s+(?:Service|Type)/i,
      ),
      serviceType: extract(
        /Service\s*Type\s*:?\s*(.*?)\s+(?:Narrative|Description)/i,
      ),
      narrative: extract(/Narrative\s*:?\s*(.*?)\s+(?:Receiver|Phone)/i),
      receiverName: titleCase(
        extract(/Receiver\s*Name\s*:?\s*(.*?)\s+(?:Phone|Institution)/i) ?? "",
      ),
      phoneNo: extract(/Phone\s*(?:No\.?|Number)?\s*:?\s*([\+\d\-\s]+)/i),
      institutionName: titleCase(
        extract(
          /Institution\s*Name\s*:?\s*(.*?)\s+(?:Transaction|Reference)/i,
        ) ?? "",
      ),
      transactionReference: extract(
        /Transaction\s*Reference\s*:?\s*([A-Z0-9\-]+)/i,
      ),
      transferReference: extract(/Transfer\s*Reference\s*:?\s*([A-Z0-9\-]+)/i),
      transactionDate: extract(
        /Transaction\s*Date\s*(?:&\s*Time)?\s*:?\s*([\d\/\-,: ]+(?:[APM]{2})?)/i,
      )
        ? new Date(
            extract(
              /Transaction\s*Date\s*(?:&\s*Time)?\s*:?\s*([\d\/\-,: ]+(?:[APM]{2})?)/i,
            )!,
          )
        : null,
      transactionAmount: extractAmount(
        /Transaction\s*Amount\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      serviceCharge: extractAmount(
        /Service\s*Charge\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      exciseTax: extractAmount(
        /Excise\s*Tax\s*(?:\(15%\))?\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      vat: extractAmount(
        /VAT\s*(?:\(15%\))?\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      penaltyFee: extractAmount(
        /Penalty\s*Fee\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      incomeTaxFee: extractAmount(
        /Income\s*Tax\s*Fee\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      interestFee: extractAmount(
        /Interest\s*Fee\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      stampDuty: extractAmount(
        /Stamp\s*Duty\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      discountAmount: extractAmount(
        /Discount\s*Amount\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      total: extractAmount(/Total\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i),
    };
  } catch (err: any) {
    logger.error("❌ Dashen PDF parsing failed:", err.message);
    return { success: false, error: "Failed to parse Dashen PDF" };
  }
}
