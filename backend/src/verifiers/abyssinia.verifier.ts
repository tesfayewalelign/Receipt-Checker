import puppeteer, { Browser } from "puppeteer";
import { VerifyResult } from "./cbe.verifier";

const titleCase = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export async function verifyAbyssinia(
  reference: string,
  accountSuffix: string,
): Promise<VerifyResult> {
  let browser: Browser | null = null;

  try {
    const url = `https://cs.bankofabyssinia.com/slip/?trx=${reference}${accountSuffix}`;
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const receipt = await page.evaluate(() => {
      const getText = (label: string) => {
        const td = Array.from(document.querySelectorAll("td")).find(
          (el) => el.textContent?.trim() === label,
        );
        return td?.nextElementSibling?.textContent?.trim() || null;
      };

      return {
        receiverAccount: getText("Receiver's Account"),
        receiverName: getText("Receiver's Name"),
        transferredAmount: parseFloat(
          (getText("Transferred amount") || "0").replace(/[^\d.]/g, ""),
        ),
        transactionType: getText("Transaction Type"),
        transactionDate: getText("Transaction Date"),
        transactionReference: getText("Transaction Reference"),
        narrative: getText("Narrative"),
      };
    });

    let transactionDate: Date | null = null;
    if (receipt.transactionDate) {
      try {
        const [day, month, yearHour] = receipt.transactionDate.split("/");
        const [year, time] = yearHour.split(" ");
        const [hour, minute] = time.split(":");
        transactionDate = new Date(
          Number(`20${year}`),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
        );
      } catch {
        transactionDate = null;
      }
    }

    return {
      success: true,
      data: {
        payer: receipt.receiverName ? titleCase(receipt.receiverName) : null,
        payerAccount: null,
        receiver: receipt.receiverName ? titleCase(receipt.receiverName) : null,
        receiverAccount: receipt.receiverAccount || null,
        amount: receipt.transferredAmount || 0,
        date: transactionDate,
        reference: receipt.transactionReference || null,
        reason: receipt.narrative || null,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: "Failed to verify Abyssinia transaction",
      data: {
        payer: null,
        payerAccount: null,
        receiver: null,
        receiverAccount: null,
        amount: 0,
        date: null,
        reference: null,
        reason: null,
      },
    };
  } finally {
    if (browser) await browser.close();
  }
}
