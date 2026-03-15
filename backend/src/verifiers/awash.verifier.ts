import puppeteer from "puppeteer";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import Tesseract from "tesseract.js";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

const cleanText = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/0/g, "O")
    .replace(/1/g, "I")
    .replace(/l/g, "I");

function detectFileType(buffer: Buffer): "pdf" | "image" {
  return buffer.slice(0, 4).toString() === "%PDF" ? "pdf" : "image";
}

async function extractReferenceFromPdf(buffer: Buffer): Promise<string | null> {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item: any) => item.str).join(" ") + " ";
  }
  const match = fullText.match(
    /Transaction\s*Reference[:\s]+(FT[A-Z0-9]{8,})/i,
  );
  return match ? match[1].toUpperCase() : null;
}

export async function extractReferenceFromImage(
  buffer: Buffer,
): Promise<string | null> {
  const processedBuffer = await sharp(buffer)
    .rotate()
    .grayscale()
    .normalize()
    .sharpen()
    .resize({ width: 2000 })
    .toBuffer();

  const worker: any = await createWorker();

  try {
    const { data } = await worker.recognize(processedBuffer, "eng");
    const text = cleanText(data.text);

    const matches = text.match(/\bFT[A-Z0-9]{6,12}\b/gi);
    if (!matches || matches.length === 0) return null;

    return matches[matches.length - 1].toUpperCase();
  } finally {
    await worker.terminate();
  }
}
export interface AwashVerifyResult {
  success: boolean;
  reference?: string;
  data?: Record<string, string>;
  stampUrl?: string | null;
  error?: string;
}

export async function verifyAwash(payload: {
  reference?: string;
  fileBuffer?: Buffer;
}): Promise<AwashVerifyResult> {
  let reference = payload.reference;

  if (!reference && payload.fileBuffer) {
    const type = detectFileType(payload.fileBuffer);
    reference =
      type === "pdf"
        ? ((await extractReferenceFromPdf(payload.fileBuffer)) ?? undefined)
        : ((await extractReferenceFromImage(payload.fileBuffer)) ?? undefined);
  }

  if (!reference) {
    return { success: false, error: "Transaction reference is required" };
  }

  let browser;
  try {
    const url = `https://awashpay.awashbank.com:8225/${reference}`;
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForSelector("table, .error-message", { timeout: 20000 });

    const data = await page.evaluate(() => {
      const tables = Array.from(
        document.querySelectorAll("table"),
      ) as HTMLElement[];
      const allFields: Record<string, string> = {};
      tables.forEach((table) => {
        Array.from(table.querySelectorAll("tr")).forEach((row) => {
          const cells = Array.from(
            row.querySelectorAll("td, th"),
          ) as HTMLElement[];
          if (cells.length >= 2) {
            const label = cells[0]?.innerText?.trim() ?? "";
            const value = cells[cells.length - 1]?.innerText?.trim() ?? "";
            if (label) allFields[label] = value;
          }
        });
      });
      const img = document.querySelector<HTMLImageElement>("img.stamp");
      return Object.keys(allFields).length > 0
        ? { all: allFields, stampUrl: img?.src || null }
        : null;
    });

    await browser.close();

    if (!data)
      return { success: false, error: "Failed to extract receipt data" };

    return {
      success: true,
      reference,
      data: data.all,
      stampUrl: data.stampUrl,
    };
  } catch (err: any) {
    if (browser) await browser.close();
    return {
      success: false,
      error: err?.message || "Awash verification failed",
    };
  }
}
