import puppeteer from "puppeteer";

export interface AwashVerifyResult {
  success: boolean;
  transactionTime?: string | null;
  transactionType?: string | null;
  transactionAmount?: string | null;
  vat?: string | null;
  senderName?: string | null;
  senderAccountNumber?: string | null;
  receiverName?: string | null;
  receiverAccountNumber?: string | null;
  beneficiaryBank?: string | null;
  reason?: string | null;
  transactionReference?: string | null;
  stampUrl?: string | null;
  error?: string;
}

export async function verifyAwash(payload: {
  reference: string;
}): Promise<AwashVerifyResult> {
  if (!payload?.reference) {
    return { success: false, error: "Transaction reference is required" };
  }

  const url = `https://awashpay.awashbank.com:8225/${payload.reference}`;
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    await page.waitForSelector("table.info-table", { timeout: 20000 });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = await page.evaluate(() => {
      const tables = Array.from(document.querySelectorAll("table.info-table"));
      let result: Record<string, string> | null = null;

      for (let i = tables.length - 1; i >= 0; i--) {
        const table = tables[i];
        const rows = Array.from(table.querySelectorAll("tr"));
        const temp: Record<string, string> = {};
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 3) {
            const label = cells[0].innerText.trim().replace(/[\r\n]/g, "");
            const value = cells[2].innerText.trim().replace(/[\r\n]/g, "");
            temp[label] = value;
          }
        });
        if (temp["Transaction ID"] && temp["Amount"]) {
          result = temp;
          break;
        }
      }

      const img = document.querySelector<HTMLImageElement>("img.stamp");
      const stampUrl = img ? img.src : null;

      return result ? { result, stampUrl } : null;
    });

    await browser.close();

    if (!data) {
      return { success: false, error: "Failed to extract receipt data" };
    }

    return {
      success: true,
      transactionTime: data.result["Transaction Time"] || null,
      transactionType: data.result["Transaction Type"] || null,
      transactionAmount: data.result["Amount"] || null,
      vat: data.result["VAT"] || null,
      senderName: data.result["Sender Name"] || null,
      senderAccountNumber: data.result["Sender Account"] || null,
      receiverName: data.result["Beneficiary name"] || null,
      receiverAccountNumber: data.result["Beneficiary Account"] || null,
      beneficiaryBank: data.result["Beneficiary Bank"] || null,
      reason: data.result["Reason"] || null,
      transactionReference: data.result["Transaction ID"] || payload.reference,
      stampUrl: data.stampUrl,
    };
  } catch (error: any) {
    if (browser) await browser.close();
    return {
      success: false,
      error: error?.message || "Awash verification failed",
    };
  }
}
