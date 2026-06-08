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

// ── Proxy URL helpers ─────────────────────────────────────────────────────

/**
 * Reads all configured proxy URLs from environment variables.
 *
 * Supported env vars (checked in order):
 *   TELEBIRR_PROXY_URL          → always included if set
 *   TELEBIRR_PROXY_URL_1        → alias / first numbered proxy
 *   TELEBIRR_PROXY_URL_2        → second proxy
 *   TELEBIRR_PROXY_URL_3 ...    → up to 9 numbered proxies
 *
 * Duplicates are removed and empty strings are filtered out.
 */
function getProxyUrls(): string[] {
  const keys = [
    "TELEBIRR_PROXY_URL",
    ...Array.from({ length: 9 }, (_, i) => `TELEBIRR_PROXY_URL_${i + 1}`),
  ];

  const seen = new Set<string>();
  const urls: string[] = [];

  for (const key of keys) {
    const val = process.env[key]?.trim();
    if (val && !seen.has(val)) {
      seen.add(val);
      urls.push(val);
    }
  }

  return urls;
}

// ── Telebirr direct URL builder ───────────────────────────────────────────

const TELEBIRR_RECEIPT_URL =
  process.env.TELEBIRR_RECEIPT_URL ??
  "https://transactioninfo.ethiotelecom.et/receipt";

function buildDirectUrl(reference: string): string {
  return `${TELEBIRR_RECEIPT_URL}/${encodeURIComponent(reference)}`;
}

// ── Verifier ──────────────────────────────────────────────────────────────

export class TelebirrVerifier {
  async verify(reference: string): Promise<TelebirrReceipt | null> {
    if (!reference) return null;

    const cleanedRef = normalizeReference(reference);
    console.log(`[verifier] Verifying reference: ${cleanedRef}`);

    // 1️⃣  Try direct (no proxy) first
    const directHtml = await this.fetchDirect(cleanedRef);
    if (directHtml) {
      const receipt = this.parseReceipt(directHtml, cleanedRef);
      if (receipt && this.validateReceipt(receipt)) {
        console.log(
          `[verifier] ✅ Verification SUCCESS (direct) for: ${cleanedRef}`,
        );
        return receipt;
      }
      console.warn(
        "[verifier] Direct fetch returned HTML but parse/validation failed — trying proxies",
      );
    } else {
      console.warn("[verifier] Direct fetch failed — trying proxies");
    }

    // 2️⃣  Try each configured proxy in order
    const proxyUrls = getProxyUrls();

    if (proxyUrls.length === 0) {
      console.error(
        "[verifier] No proxy URLs configured.\n" +
          "           Set TELEBIRR_PROXY_URL (or TELEBIRR_PROXY_URL_1, _2 …) in your .env file.",
      );
      return null;
    }

    for (let i = 0; i < proxyUrls.length; i++) {
      const proxyUrl = proxyUrls[i];
      const label = `proxy #${i + 1} (${proxyUrl})`;
      console.log(`[verifier] Trying ${label} …`);

      const html = await this.fetchFromProxy(cleanedRef, proxyUrl);
      if (!html) {
        console.warn(`[verifier] ${label} returned no HTML — trying next`);
        continue;
      }

      const receipt = this.parseReceipt(html, cleanedRef);
      if (!receipt) {
        console.warn(
          `[verifier] ${label}: HTML received but parse failed — trying next`,
        );
        continue;
      }

      if (!this.validateReceipt(receipt)) {
        console.warn(
          `[verifier] ${label}: parsed but validation failed — trying next`,
          receipt,
        );
        continue;
      }

      console.log(
        `[verifier] ✅ Verification SUCCESS via ${label} for: ${cleanedRef}`,
      );
      return receipt;
    }

    console.error(
      `[verifier] ❌ All ${proxyUrls.length} proxy(ies) exhausted — verification failed`,
    );
    return null;
  }

  // ── Direct fetch (no proxy) ─────────────────────────────────────────────

  private async fetchDirect(reference: string): Promise<string | null> {
    const url = buildDirectUrl(reference);
    console.log(`[verifier] Attempting direct fetch: ${url}`);

    try {
      const response = await axios.get(url, {
        timeout: 15_000,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TelebirrVerifier/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        // Don't throw on non-2xx so we can inspect the body
        validateStatus: (s) => s < 500,
      });

      if (response.status >= 400) {
        console.warn(
          `[verifier] Direct fetch HTTP ${response.status} — treating as failure`,
        );
        return null;
      }

      const html =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data);

      if (!html || html.trim().length < 50) {
        console.warn("[verifier] Direct fetch returned empty / tiny body");
        return null;
      }

      return html;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.warn(
          `[verifier] Direct fetch axios error [${err.code ?? err.response?.status ?? "?"}]: ${err.message}`,
        );
      } else {
        console.warn(
          `[verifier] Direct fetch unexpected error: ${err.message}`,
        );
      }
      return null;
    }
  }

  private async fetchFromProxy(
    reference: string,
    proxyUrl: string,
  ): Promise<string | null> {
    try {
      const response = await axios.post(
        `${proxyUrl}/verify`,
        { reference },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 45_000, // proxies may use Puppeteer — give them time
        },
      );

      if (response.data?.error) {
        console.error("[verifier] Proxy returned error:", response.data.error);
        return null;
      }

      if (!response.data?.html) {
        console.error("[verifier] Proxy returned no HTML field");
        return null;
      }

      return response.data.html as string;
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
