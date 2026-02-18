import puppeteer, { Browser, HTTPResponse } from "puppeteer";
import axios from "axios";
import https from "https";

const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");

export interface VerifyResult {
  success: boolean;
  data?: {
    payer: string | null;
    payerAccount: string | null;
    receiver: string | null;
    receiverAccount: string | null;
    amount: number | null;
    date: Date | null;
    reference: string | null;
    receiptNo?: string | null;
    total?: number | null;
    vat?: number | null;
    serviceFee?: number | null;
    reason?: string | null;
  };
  error?: string;
}

const titleCase = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function extractReferenceFromUploadedPdf(
  buffer: Buffer,
): Promise<string> {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i: any) => i.str).join(" ") + " ";
  }

  const raw = text.replace(/\s+/g, " ");

  const reference = raw.match(
    /Reference\s+No\.?\s*\(VAT\s+Invoice\s+No\)\s+([A-Z0-9]+)/i,
  )?.[1];

  if (!reference) {
    throw new Error("Reference not found in uploaded PDF");
  }

  return reference;
}

async function extractReferenceFromImage(buffer: Buffer): Promise<string> {
  throw new Error("Image OCR not implemented yet");
}

export async function verifyCBE(payload: {
  pdfBuffer?: Buffer;
  reference?: string;
  accountSuffix?: string;
  fileType?: "pdf" | "image";
}): Promise<VerifyResult> {
  try {
    if (!payload.accountSuffix) {
      return { success: false, error: "accountSuffix is required" };
    }

    let reference = payload.reference;

    if (!reference && payload.pdfBuffer) {
      if (payload.fileType === "pdf") {
        reference = await extractReferenceFromUploadedPdf(payload.pdfBuffer);
      } else {
        reference = await extractReferenceFromImage(payload.pdfBuffer);
      }
    }

    if (!reference) {
      return { success: false, error: "Reference not found" };
    }

    const officialPdf = await fetchCBEReceiptPdf(
      reference,
      payload.accountSuffix,
    );

    return await parseCBEReceipt(officialPdf);
  } catch (err: any) {
    console.error("❌ Verification failed:", err.message);
    return { success: false, error: err.message };
  }
}

async function fetchCBEReceiptPdf(
  reference: string,
  accountSuffix: string,
): Promise<Buffer> {
  const fullId = `${reference.trim()}${accountSuffix.trim()}`;
  const url = `https://apps.cbe.com.et:100/?id=${fullId}`;

  let browser: Browser | null = null;
  let pdfUrl: string | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    );

    page.on("response", (response: HTTPResponse) => {
      const ct = response.headers()["content-type"];
      if (ct && ct.includes("application/pdf")) {
        pdfUrl = response.url();
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    if (!pdfUrl) throw new Error("Receipt PDF not found on page.");

    const download = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      httpsAgent,
      timeout: 30000,
    });

    return Buffer.from(download.data);
  } finally {
    if (browser) await browser.close();
  }
}

export async function parseCBEReceipt(
  buffer: Buffer | ArrayBuffer,
): Promise<VerifyResult> {
  try {
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjs.getDocument({
      data: uint8Array,

      standardFontDataUrl: "https://unpkg.com",
      useSystemFonts: true,
      disableFontFace: true,
    });

    const pdfDocument = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageItems: any[] = textContent.items;
      const pageText = pageItems.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    const rawText = fullText.replace(/\s+/g, " ").trim();
    console.log("📄 Processing Raw Text...");

    const payerMatch = rawText.match(/Payer\s+(.*?)\s+Account\s+([\w*]+)/i);

    const receiverMatch = rawText.match(
      /Receiver\s+(.*?)\s+Account\s+([\w*]+)/i,
    );

    const refMatch = rawText.match(
      /Reference\s+No\.?\s*\(VAT\s+Invoice\s+No\)\s+([A-Z0-9]+)/i,
    );

    const amountMatch = rawText.match(
      /Transferred\s+Amount\s+([\d,]+\.\d{2})\s+ETB/i,
    );

    const dateMatch = rawText.match(
      /Payment\s+Date\s+&\s+Time\s+([\d\/,: ]+(?:AM|PM))/i,
    );

    const reasonMatch = rawText.match(
      /Reason\s*\/\s*Type\s+of\s+service\s+(.*?)\s+Transferred/i,
    );

    const payerName = payerMatch?.[1]?.trim();
    const payerAccount = payerMatch?.[2]?.trim();
    const receiverName = receiverMatch?.[1]?.trim();
    const receiverAccount = receiverMatch?.[2]?.trim();
    const reference = refMatch?.[1]?.trim();
    const amountText = amountMatch?.[1]?.trim();
    const dateText = dateMatch?.[1]?.trim();

    if (payerName && receiverName && reference && amountText && dateText) {
      return {
        success: true,
        data: {
          payer: titleCase(payerName),
          payerAccount: payerAccount || "N/A",
          receiver: titleCase(receiverName),
          receiverAccount: receiverAccount || "N/A",
          amount: parseFloat(amountText.replace(/,/g, "")),
          date: new Date(dateText.replace(",", "")),
          reference: reference,
          reason: reasonMatch?.[1]?.trim() || null,
        },
      };
    } else {
      const missing = [];
      if (!payerName) missing.push("Payer");
      if (!receiverName) missing.push("Receiver");
      if (!reference) missing.push("Reference");
      if (!amountText) missing.push("Amount");
      if (!dateText) missing.push("Date");

      console.error("❌ Extraction incomplete. Missing:", missing.join(", "));
      return {
        success: false,
        error: `Could not extract: ${missing.join(", ")}`,
      };
    }
  } catch (err: any) {
    console.error("❌ Parser Error:", err.message);
    return { success: false, error: "Failed to parse PDF: " + err.message };
  }
}
