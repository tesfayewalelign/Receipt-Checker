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
  allFields?: Record<string, string>;
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

    await page.waitForSelector("table, .error-message", { timeout: 20000 });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    let data: { all: Record<string, string>; stampUrl: string | null } | null =
      null;
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
      data = await page.evaluate(() => {
        const tables = Array.from(
          document.querySelectorAll("table"),
        ) as HTMLElement[];
        const allFields: Record<string, string> = {};

        tables.forEach((table) => {
          const rows = Array.from(
            table.querySelectorAll("tr"),
          ) as HTMLElement[];
          rows.forEach((row) => {
            const cells = Array.from(
              row.querySelectorAll("td, th"),
            ) as HTMLElement[];
            if (cells.length >= 2) {
              const label =
                cells[0]?.innerText?.trim().replace(/[\r\n]/g, "") ?? "";
              const value =
                cells[cells.length - 1]?.innerText
                  ?.trim()
                  .replace(/[\r\n]/g, "") ?? "";
              if (label) allFields[label] = value;
            }
          });
        });

        const img = document.querySelector<HTMLImageElement>("img.stamp");
        const stampUrl = img ? img.src : null;

        return Object.keys(allFields).length > 0
          ? { all: allFields, stampUrl }
          : null;
      });

      if (data) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const errorMsg = await page
      .$eval(".error-message", (el) => el.textContent)
      .catch(() => null);
    if (errorMsg) {
      await browser.close();
      return {
        success: false,
        error: `Transaction not found: ${errorMsg.trim()}`,
      };
    }

    await browser.close();

    if (!data) {
      return { success: false, error: "Failed to extract receipt data" };
    }

    const r = data.all;

    const labelMap: Record<string, string[]> = {
      transactionTime: ["Date"],
      transactionType: ["Trans type"],
      transactionAmount: ["Amount"],
      vat: ["VAT", "VAT Reg No", "VAT Reg Date"],
      senderName: ["Customer Name", "Name"],
      senderAccountNumber: ["Account No", "Account"],
      receiverName: ["Recipient", "Receiver Name", "Beneficiary name"],
      receiverAccountNumber: ["Beneficiary Account", "Account"],
      beneficiaryBank: ["Beneficiary Bank", "Bank"],
      reason: ["Reason"],
      transactionReference: ["Txn Ref", "Transaction ID"],
    };

    const getMappedValue = (keys: string[]): string | null => {
      for (const key of keys) {
        if (r[key]) return r[key];
      }
      return null;
    };

    return {
      success: true,
      transactionTime: getMappedValue(labelMap.transactionTime),
      transactionType: getMappedValue(labelMap.transactionType),
      transactionAmount: getMappedValue(labelMap.transactionAmount),
      vat: getMappedValue(labelMap.vat),
      senderName: getMappedValue(labelMap.senderName),
      senderAccountNumber: getMappedValue(labelMap.senderAccountNumber),
      receiverName: getMappedValue(labelMap.receiverName),
      receiverAccountNumber: getMappedValue(labelMap.receiverAccountNumber),
      beneficiaryBank: getMappedValue(labelMap.beneficiaryBank),
      reason: getMappedValue(labelMap.reason),
      transactionReference:
        getMappedValue(labelMap.transactionReference) || payload.reference,
      stampUrl: data.stampUrl || null,
      allFields: r,
    };
  } catch (error: any) {
    if (browser) await browser.close();
    return {
      success: false,
      error: error?.message || "Awash verification failed",
    };
  }
}
