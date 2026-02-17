import puppeteer, { Browser, Page } from "puppeteer";
import pdfjs from "pdfjs-dist/legacy/build/pdf.js";

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
    reason?: string | null;
  };
  error?: string;
}

const titleCase = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

async function safeGoto(page: Page, url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      return;
    } catch (err) {
      console.log(`Retry ${i + 1} failed: ${(err as Error).message}`);
      if (i === retries - 1) throw err;
    }
  }
}

async function clickDownloadButton(page: Page) {
  const timeout = 20000;
  const interval = 500;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const btnHandle = await (page as any).$x(
      "//button[contains(text(), 'Download PDF')]",
    );
    if (btnHandle.length > 0) {
      await btnHandle[0].click();
      return true;
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error("Download PDF button not found within timeout");
}

async function parseAbyssiniaPdf(
  buffer: Buffer | ArrayBuffer,
): Promise<VerifyResult> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((i: any) => i.str).join(" ") + " ";
    }

    const rawText = fullText.replace(/\s+/g, " ").trim();

    const receiverMatch = rawText.match(
      /Receiver'?s?\s+Name\s+(.*?)\s+Receiver'?s?\s+Account/i,
    );
    const accountMatch = rawText.match(/Receiver'?s?\s+Account\s+([\w*]+)/i);
    const amountMatch = rawText.match(
      /Transferred\s+amount\s+([\d,]+\.\d{2})/i,
    );
    const referenceMatch = rawText.match(
      /Transaction\s+Reference\s+([A-Z0-9]+)/i,
    );
    const dateMatch = rawText.match(/Transaction\s+Date\s+([\d\/:\s]+)/i);

    if (
      !receiverMatch ||
      !accountMatch ||
      !amountMatch ||
      !referenceMatch ||
      !dateMatch
    ) {
      return {
        success: false,
        error: "Could not extract all required fields from PDF",
      };
    }

    return {
      success: true,
      data: {
        payer: receiverMatch[1].trim(),
        payerAccount: null,
        receiver: receiverMatch[1].trim(),
        receiverAccount: accountMatch[1].trim(),
        amount: parseFloat(amountMatch[1].replace(/,/g, "")),
        date: new Date(dateMatch[1].trim()),
        reference: referenceMatch[1].trim(),
        reason: null,
      },
    };
  } catch (err: any) {
    return { success: false, error: "PDF parsing failed: " + err.message };
  }
}

export async function verifyAbyssinia(
  reference: string,
  accountSuffix: string,
  proxy?: string,
): Promise<VerifyResult> {
  const fullId = `${reference.trim()}${accountSuffix.trim()}`;
  const url = `https://cs.bankofabyssinia.com/slip/?trx=${fullId}`;

  let browser: Browser | null = null;

  try {
    const launchArgs = ["--no-sandbox", "--disable-setuid-sandbox"];
    if (proxy) launchArgs.push(`--proxy-server=${proxy}`);

    browser = await puppeteer.launch({
      headless: false,
      args: launchArgs,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0 Safari/537.36",
    );

    await page.evaluateOnNewDocument(() => {
      const originalSave = (window as any).jsPDF?.prototype?.save;
      if (originalSave) {
        (window as any).jsPDF.prototype.save = function (filename: string) {
          const pdfData = this.output("arraybuffer");
          (window as any).__capturedPdf = pdfData;
          return originalSave.call(this, filename);
        };
      }
    });

    await safeGoto(page, url, 3);

    await clickDownloadButton(page);

    await page.waitForFunction(
      () => (window as any).__capturedPdf !== undefined,
      { timeout: 20000 },
    );

    const pdfBuffer: ArrayBuffer = await page.evaluate(
      () => (window as any).__capturedPdf,
    );

    return await parseAbyssiniaPdf(pdfBuffer);
  } catch (err: any) {
    return { success: false, error: err.message };
  } finally {
    if (browser) await browser.close();
  }
}
