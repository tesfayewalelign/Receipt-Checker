import axios from "axios";
import * as cheerio from "cheerio";
import { createWorker } from "tesseract.js";
import sharp from "sharp";
import { VerifyResult } from "./cbe.verifier";
import logger from "../utils/logger";

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

export async function extractReferenceFromPdf(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i: any) => i.str).join(" ") + " ";
  }
  const match = text.replace(/\s+/g, "").match(/DB[A-Z0-9]{7,12}/i);
  if (!match) throw new Error("Reference not found in PDF");
  return match[0].toUpperCase();
}

export async function extractReferenceFromImage(
  buffer: Buffer,
): Promise<string> {
  const processed = await sharp(buffer)
    .resize({ width: 2000 })
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer();

  const worker: any = await createWorker();
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  });

  const { data } = await worker.recognize(processed);
  await worker.terminate();

  let text = data.text
    .replace(/\s+/g, "")
    .replace(/0/g, "O")
    .replace(/1/g, "I");
  const match = text.match(/DB[A-Z0-9]{7,12}/i);
  if (!match) throw new Error("Reference not found in image");
  return match[0].toUpperCase();
}

export class TelebirrVerifier {
  private readonly BASE_URL = "https://transactioninfo.ethiotelecom.et/receipt";

  async verify(reference: string): Promise<TelebirrReceipt> {
    if (!/^DB[A-Z0-9]{7,12}$/i.test(reference))
      throw new Error("Invalid reference format");

    const html = await this.fetchReceipt(reference);
    if (!html || html.includes("This request is not correct"))
      throw new Error("Invalid Telebirr reference or receipt not found");

    const receipt = this.parseReceipt(html, reference);
    if (!receipt) throw new Error("Failed to parse receipt");

    if (!this.validateReceipt(receipt))
      throw new Error("Receipt validation failed");

    return receipt;
  }

  private async fetchReceipt(reference: string): Promise<string> {
    try {
      const response = await axios.get(`${this.BASE_URL}/${reference}`, {
        timeout: 15000,
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      return response.data;
    } catch (err: any) {
      throw new Error("Failed to fetch Telebirr receipt: " + err.message);
    }
  }

  private parseReceipt(
    html: string,
    reference: string,
  ): TelebirrReceipt | null {
    const $ = cheerio.load(html);
    let payer: string | undefined;
    let receiver: string | undefined;
    let status: string | undefined;
    let receiptNo: string | undefined;
    let dateStr: string | undefined;
    let amountStr: string | undefined;

    $("td").each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes("Payer Name")) payer = $(el).next("td").text().trim();
      if (text.includes("Credited Party name"))
        receiver = $(el).next("td").text().trim();
      if (text.toLowerCase().includes("transaction status"))
        status = $(el).next("td").text().trim();
    });

    $("table tr").each((_, row) => {
      const cols = $(row).find("td");
      if (cols.length >= 3) {
        const invoice = $(cols[0]).text().trim();
        const date = $(cols[1]).text().trim();
        const amount = $(cols[2]).text().trim();
        if (invoice === reference) {
          receiptNo = invoice;
          dateStr = date;
          amountStr = amount;
        }
      }
    });

    if (!receiptNo || !dateStr || !amountStr || !status) return null;
    const amount = parseFloat(amountStr.replace(/[^\d.]/g, ""));
    const date = new Date(dateStr);
    if (isNaN(amount) || isNaN(date.getTime())) return null;

    return {
      reference,
      receiptNo,
      amount,
      totalPaid: amount,
      payer,
      receiver,
      status,
      date,
    };
  }

  private validateReceipt(receipt: TelebirrReceipt): boolean {
    if (!receipt.reference || !receipt.amount || receipt.amount <= 0)
      return false;
    if (!receipt.receiptNo || !receipt.date) return false;
    return ["success", "paid", "complete"].some((s) =>
      receipt.status.toLowerCase().includes(s),
    );
  }
}

export async function verifyTelebirr(payload: {
  reference?: string;
  fileBuffer?: Buffer;
  fileType?: "pdf" | "image";
}): Promise<VerifyResult> {
  try {
    let reference = payload.reference;

    if (!reference && payload.fileBuffer) {
      reference =
        payload.fileType === "pdf"
          ? await extractReferenceFromPdf(payload.fileBuffer)
          : await extractReferenceFromImage(payload.fileBuffer);
    }

    if (!reference)
      throw new Error("Reference not provided or could not be extracted");

    const verifier = new TelebirrVerifier();
    const receipt = await verifier.verify(reference);

    return {
      success: true,
      data: {
        payer: receipt.payer ?? "",
        payerAccount: "",
        receiver: receipt.receiver ?? "",
        receiverAccount: "",
        amount: receipt.amount,
        date: receipt.date,
        reference: receipt.reference,
        reason: undefined,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
