import axios from "axios";
import * as cheerio from "cheerio";
import Tesseract from "tesseract.js";

// ── Types ─────────────────────────────────────────────────────────────────

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

export interface VerifyResult {
  success: boolean;
  data?: {
    payer: string;
    payerAccount: string;
    receiver: string;
    receiverAccount: string;
    amount: number;
    date: Date;
    reference: string;
    reason?: string;
  };
  error?: string;
}

// ── Reference Extractors ──────────────────────────────────────────────────

export async function extractReferenceFromPdf(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i: any) => i.str).join(" ") + " ";
  }
  const match = text.match(/DB[A-Z0-9]+/i);
  if (!match) throw new Error("Reference not found in PDF");
  return normalizeReference(match[0]);
}

export async function extractReferenceFromImage(
  buffer: Buffer,
): Promise<string> {
  const result = await Tesseract.recognize(buffer, "eng");
  const cleaned = result.data.text
    .replace(/\s+/g, "")
    .replace(/0/g, "O")
    .replace(/1/g, "I");
  const match = cleaned.match(/[A-Z]{2}[A-Z0-9]{8,}/);
  if (!match) throw new Error("Reference not found in image");
  return normalizeReference(match[0]);
}

function normalizeReference(reference: string): string {
  return reference
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

export class TelebirrVerifier {
  async verify(reference: string): Promise<TelebirrReceipt | null> {
    if (!reference) return null;

    const cleanedRef = normalizeReference(reference);
    console.log(`[verifier] Verifying reference: ${cleanedRef}`);

    // Get HTML from proxy (proxy is on ET network, so it can access the site)
    const html = await this.fetchFromProxy(cleanedRef);

    if (!html) {
      console.error("[verifier] Could not get HTML from proxy");
      return null;
    }

    const receipt = this.parseReceipt(html, cleanedRef);

    if (!receipt) {
      console.error("[verifier] Failed to parse receipt from HTML");
      return null;
    }

    if (!this.validateReceipt(receipt)) {
      console.error("[verifier] Receipt validation failed:", receipt);
      return null;
    }

    console.log(`[verifier] ✅ Verification SUCCESS for: ${cleanedRef}`);
    return receipt;
  }

  private async fetchFromProxy(reference: string): Promise<string | null> {
    const proxyUrl = process.env.TELEBIRR_PROXY_URL;

    if (!proxyUrl) {
      console.error(
        "[verifier] TELEBIRR_PROXY_URL is not set in your .env file!\n" +
          "           Add: TELEBIRR_PROXY_URL=http://localhost:4000\n" +
          "           Or the public URL from localhost.run / ngrok",
      );
      return null;
    }

    try {
      console.log(`[verifier] Calling proxy at: ${proxyUrl}`);

      const response = await axios.post(
        `${proxyUrl}/verify`,
        { reference },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 45000, // 45 seconds — proxy may need time to use Puppeteer
        },
      );

      if (response.data?.error) {
        console.error("[verifier] Proxy returned error:", response.data.error);
        return null;
      }

      if (!response.data?.html) {
        console.error("[verifier] Proxy returned no HTML");
        return null;
      }

      return response.data.html;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.error(
          `[verifier] Proxy request failed [${err.response?.status ?? "no response"}]: ${err.message}`,
        );
      } else {
        console.error(
          "[verifier] Unexpected error calling proxy:",
          err.message,
        );
      }
      return null;
    }
  }

  private parseReceipt(
    html: string,
    reference: string,
  ): TelebirrReceipt | null {
    try {
      const $ = cheerio.load(html);

      let amount: number | null = null;
      let date: Date | null = null;
      let status: string | null = null;
      let receiptNo: string | null = null;
      let payer: string | null = null;
      let receiver: string | null = null;

      // Read structured table rows first
      $("table tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 2) return;

        const label = cells.eq(0).text().trim().toLowerCase();
        const value = cells.eq(1).text().trim();

        if (/amount/i.test(label)) {
          const m = value.match(/([\d,]+\.?\d*)/);
          if (m) amount = parseFloat(m[1].replace(/,/g, ""));
        } else if (/date|time/i.test(label)) {
          date = parseEtDate(value);
        } else if (/status/i.test(label)) {
          status = value;
        } else if (/receipt.*no|transaction.*id/i.test(label)) {
          receiptNo = value;
        } else if (/payer|sender|from/i.test(label)) {
          payer = value;
        } else if (/receiver|recipient|to/i.test(label)) {
          receiver = value;
        }
      });

      // Fall back to body text search if table parsing missed anything
      const bodyText = $("body").text().replace(/\s+/g, " ");

      if (!amount) {
        const m = bodyText.match(/([\d,]+\.\d{2})\s?(?:Birr|ETB)/i);
        if (m) amount = parseFloat(m[1].replace(/,/g, ""));
      }

      if (!date) {
        const m = bodyText.match(
          /\d{2}[\/\-]\d{2}[\/\-]\d{4}\s\d{2}:\d{2}(?::\d{2})?/,
        );
        if (m) date = parseEtDate(m[0]);
      }

      if (!status) {
        const m = bodyText.match(
          /(success|successful|paid|complete|completed|failed|pending)/i,
        );
        if (m) status = m[0];
      }

      // All three are required
      if (!amount || isNaN(amount) || !date || !status) {
        console.error("[verifier] parseReceipt: missing fields", {
          amount,
          date,
          status,
        });
        return null;
      }

      return {
        reference,
        receiptNo: receiptNo ?? reference,
        amount,
        totalPaid: amount,
        payer: payer ?? undefined,
        receiver: receiver ?? undefined,
        status,
        date,
      };
    } catch (err: any) {
      console.error("[verifier] parseReceipt threw:", err.message);
      return null;
    }
  }

  private validateReceipt(receipt: TelebirrReceipt): boolean {
    if (
      !receipt.reference ||
      !receipt.amount ||
      receipt.amount <= 0 ||
      !receipt.date
    ) {
      return false;
    }
    const successWords = ["success", "paid", "complete", "completed"];
    return successWords.some((word) =>
      receipt.status.toLowerCase().includes(word),
    );
  }
}

function parseEtDate(raw: string): Date | null {
  const parts = raw.split(/[\/\- :]/);
  if (parts.length < 5) return null;
  try {
    return new Date(
      Number(parts[2]), // year
      Number(parts[1]) - 1, // month (0-based)
      Number(parts[0]), // day
      Number(parts[3]), // hour
      Number(parts[4]), // minute
      Number(parts[5] ?? 0), // second
    );
  } catch {
    return null;
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

    if (!reference) {
      throw new Error(
        "Reference not provided and could not be extracted from file",
      );
    }

    const verifier = new TelebirrVerifier();
    const receipt = await verifier.verify(reference);

    if (!receipt) {
      throw new Error(
        "Telebirr verification failed — receipt not found or invalid",
      );
    }

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
