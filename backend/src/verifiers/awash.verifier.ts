import fs from "fs";
import path from "path";
import axios, { AxiosResponse } from "axios";
import https from "https";
import Tesseract from "tesseract.js";
import logger from "../utils/logger";

const pdfParse = require("pdf-parse");

export interface AwashVerifyResult {
  success: boolean;
  senderName?: string | null;
  senderAccountNumber?: string | null;
  receiverName?: string | null;
  receiverAccountNumber?: string | null;
  transactionReference?: string | null;
  transactionDate?: Date | null;
  transactionAmount?: number | null;
  serviceCharge?: number | null;
  vat?: number | null;
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

    const match = text.match(/[A-Z0-9]{8,}/i);
    return match ? match[0].toUpperCase() : null;
  } catch (err: any) {
    logger.error(
      "❌ Failed to extract Awash transaction reference:",
      err.message,
    );
    return null;
  }
}

export async function verifyAwash(input: {
  reference?: string;
  filePath?: string;
  fileBuffer?: Buffer;
  fileType?: "pdf" | "image";
}): Promise<AwashVerifyResult> {
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

    const url = `https://online.awashbank.com/receipt/${transactionReference}`;

    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    logger.info(`🔎 Fetching Awash receipt: ${url}`);

    const response: AxiosResponse<ArrayBuffer> = await axios.get(url, {
      httpsAgent,
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/pdf",
      },
      timeout: 30000,
    });

    logger.info("✅ Awash receipt fetched. Parsing PDF...");

    return await parseAwashReceipt(response.data);
  } catch (err: any) {
    logger.error("❌ Awash verification failed:", err.message);
    return { success: false, error: err.message };
  }
}

async function parseAwashReceipt(
  buffer: ArrayBuffer,
): Promise<AwashVerifyResult> {
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
        extract(/Sender\s*Name\s*:?\s*(.*?)\s+(?:Account|Receiver)/i) ?? "",
      ),
      senderAccountNumber: extract(
        /Sender\s*Account\s*(?:Number)?\s*:?\s*([A-Z0-9\*\-]+)/i,
      ),
      receiverName: titleCase(
        extract(/Receiver\s*Name\s*:?\s*(.*?)\s+(?:Account|Amount)/i) ?? "",
      ),
      receiverAccountNumber: extract(
        /Receiver\s*Account\s*(?:Number)?\s*:?\s*([A-Z0-9\*\-]+)/i,
      ),
      transactionReference: extract(
        /Transaction\s*Reference\s*:?\s*([A-Z0-9\-]+)/i,
      ),
      transactionDate: extract(
        /Transaction\s*Date\s*:?\s*([\d\/\-,: ]+(?:[APM]{2})?)/i,
      )
        ? new Date(
            extract(/Transaction\s*Date\s*:?\s*([\d\/\-,: ]+(?:[APM]{2})?)/i)!,
          )
        : null,
      transactionAmount: extractAmount(
        /Transaction\s*Amount\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      serviceCharge: extractAmount(
        /Service\s*Charge\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i,
      ),
      vat: extractAmount(/VAT\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i),
      total: extractAmount(/Total\s*(?:ETB|Birr)?\s*([\d,]+\.?\d*)/i),
    };
  } catch (err: any) {
    logger.error("❌ Awash PDF parsing failed:", err.message);
    return { success: false, error: "Failed to parse Awash PDF" };
  }
}
