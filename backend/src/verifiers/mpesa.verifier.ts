import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import puppeteer from "puppeteer";
import { VerifyResult } from "./cbe.verifier";

// ─────────────────────────────────────────────
// EXTRACT REF
// ─────────────────────────────────────────────

function extractReference(text: string): string | null {
  const match = text.match(/UBH[A-Z0-9]{6,}/i);
  return match ? match[0].toUpperCase() : null;
}

// ─────────────────────────────────────────────
// PDF READER
// ─────────────────────────────────────────────

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i: any) => i.str).join(" ") + "\n";
  }

  return text;
}

async function extractTextFromPdf(filePath: string): Promise<string> {
  return extractTextFromPdfBuffer(fs.readFileSync(filePath));
}

async function extractTextFromImage(filePath: string): Promise<string> {
  const result = await Tesseract.recognize(filePath, "eng+amh");
  return result.data.text;
}

// ─────────────────────────────────────────────
// PARSER (UNCHANGED LOGIC)
// ─────────────────────────────────────────────

function parseMpesaPdfText(text: string): VerifyResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const fullText = lines.join(" ");

  let payer: string | null = null;
  let payerAccount: string | null = null;
  let receiver: string | null = null;
  let receiverAccount: string | null = null;
  let amount: number | null = null;
  let totalAmount: number | null = null;
  let serviceCharge: number | null = null;
  let vat: number | null = null;
  let date: Date | null = null;
  let reference: string | null = null;
  let reason: string | null = null;

  reference = fullText.match(/UBH[A-Z0-9]{7,}/i)?.[0] || null;

  const dateMatch = fullText.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
  if (dateMatch) date = new Date(dateMatch[1]);

  const nameLabelMatch = fullText.match(
    /SENDER NAME\s+([A-Za-z\s]+?)\s+(251\d{9})/i,
  );

  if (nameLabelMatch) {
    payer = nameLabelMatch[1].trim();
    payerAccount = nameLabelMatch[2].trim();
  } else {
    const genericNameMatch = fullText.match(
      /NAME\s+([A-Za-z\s]+?)\s+(251\d{9})/i,
    );

    if (genericNameMatch) {
      payer = genericNameMatch[1].trim();
      payerAccount = genericNameMatch[2].trim();
    } else {
      const phoneMatch = fullText.match(/(251\d{9})/);

      if (phoneMatch) {
        payerAccount = phoneMatch[1];

        const wordsBefore = fullText
          .substring(0, phoneMatch.index ?? 0)
          .split(/\s+/)
          .filter(Boolean);

        const candidate = wordsBefore.slice(-5).join(" ");

        const cleaned = candidate
          .replace(
            /SENDER|NAME|NUMBER|PHONE|TEL|ACCOUNT|ID|NO|M-PESA|THANK|YOU/gi,
            "",
          )
          .trim();

        payer = /^[A-Za-z]+\s+[A-Za-z]+/.test(cleaned)
          ? cleaned
          : "M-PESA User";
      }
    }
  }

  const bankMatch = fullText.match(/Commercial Bank of Ethiopia/i);
  const accMatch = fullText.match(/(\d{13})/);

  if (bankMatch) receiver = bankMatch[0];
  if (accMatch) receiverAccount = accMatch[0];

  const settledMatch =
    fullText.match(/SETTLED AMOUNT\s+([0-9]+\.[0-9]{2})/i) ||
    fullText.match(/SETTLED AMOUNT.*?(\d+\.\d{2})/i);

  if (settledMatch) amount = parseFloat(settledMatch[1]);

  const serviceFeeMatch = fullText.match(
    /SERVICE FEE\s+([0-9]+(?:\.[0-9]{1,2})?)/i,
  );
  if (serviceFeeMatch) serviceCharge = parseFloat(serviceFeeMatch[1]);

  const vatMatch = fullText.match(/VAT\s+([0-9]+(?:\.[0-9]{1,2})?)/i);
  if (vatMatch) vat = parseFloat(vatMatch[1]);

  const totalMatch = fullText.match(
    /TOTAL\s*(?:AMOUNT)?\s*([0-9]+\.[0-9]{2})/i,
  );

  if (totalMatch) {
    totalAmount = parseFloat(totalMatch[1]);
  } else {
    const lastAmount = fullText.match(/(\d+\.\d{2})\s+THANK YOU/i);
    if (lastAmount) totalAmount = parseFloat(lastAmount[1]);
  }

  const reasonMatch = fullText.match(/PAYMENT REASON\s+(\w+)/i);
  if (reasonMatch) reason = reasonMatch[1];

  return {
    success: true,
    data: {
      payer,
      payerAccount,
      receiver,
      receiverAccount,
      amount,
      date,
      reference,
      reason,
      serviceCharge,
      vat,
      totalAmount,
    },
  };
}

// ─────────────────────────────────────────────
// MAIN VERIFIER
// ─────────────────────────────────────────────

export async function verifyMPesa(input: {
  reference?: string;
  fileBuffer?: Buffer;
  filePath?: string;
  fileType?: "pdf" | "image";
}): Promise<VerifyResult> {
  try {
    let reference = input.reference;

    // extract reference from file if needed
    if (!reference && (input.fileBuffer || input.filePath)) {
      let text = "";

      if (input.fileBuffer) {
        // Honour the uploaded file's type. An uploaded photo/screenshot must be
        // OCR'd; feeding image bytes to the PDF text extractor throws, which is
        // why every M-Pesa image upload reported "reference not found".
        text =
          input.fileType === "image"
            ? (await Tesseract.recognize(input.fileBuffer, "eng+amh")).data.text
            : await extractTextFromPdfBuffer(input.fileBuffer);
      } else if (input.filePath) {
        const ext = path.extname(input.filePath).toLowerCase();
        text =
          ext === ".pdf"
            ? await extractTextFromPdf(input.filePath)
            : await extractTextFromImage(input.filePath);
      }

      reference = extractReference(text) || undefined;

      if (!reference) {
        return {
          success: false,
          error: "Transaction reference not found in file",
        };
      }
    }

    if (!reference) {
      return {
        success: false,
        error: "Transaction reference or file is required",
      };
    }

    return await fetchMpesaReceipt(reference);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "MPESA verification failed",
    };
  }
}

// ─────────────────────────────────────────────
// FETCH RECEIPT (FIXED + STABLE)
// ─────────────────────────────────────────────

async function fetchMpesaReceipt(reference: string): Promise<VerifyResult> {
  const url = `https://m-pesabusiness.safaricom.et/receipt/${reference}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let pdfBuffer: Buffer | null = null;

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    );

    // capture PDF response
    page.on("response", async (res) => {
      try {
        const ct = res.headers()["content-type"] || "";

        if (ct.includes("application/pdf")) {
          pdfBuffer = Buffer.from(await res.buffer());
        }
      } catch {}
    });

    // open page
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // IMPORTANT: trigger download button click

    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("button, a")).find((e) =>
        e.textContent?.toLowerCase().includes("download"),
      );

      if (el) (el as HTMLElement).click();
    });

    // wait for pdf
    let wait = 0;
    while (!pdfBuffer && wait < 15000) {
      await new Promise((r) => setTimeout(r, 500));
      wait += 500;
    }

    if (!pdfBuffer) {
      throw new Error("MPESA PDF not captured after click");
    }

    const text = await extractTextFromPdfBuffer(pdfBuffer);

    return parseMpesaPdfText(text);
  } finally {
    await browser.close();
  }
}
