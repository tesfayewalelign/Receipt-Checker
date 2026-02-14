import axios, { AxiosError } from "axios";
import logger from "../utils/logger";
import { VerifyResult } from "./verifyCBE";

export interface AbyssiniaReceipt {
  payerName: string;
  sourceAccount: string;
  sourceAccountName: string;
  transferredAmount: number;
  transactionReference: string;
  transactionDate: Date;
  narrative?: string | null;
  vat?: string;
  totalAmountIncludingVAT?: string;
  serviceCharge?: string;
  transactionType?: string;
  tel?: string;
  address?: string;
}

export async function verifyAbyssinia(
  reference: string,
  suffix: string,
): Promise<VerifyResult> {
  try {
    logger.info(
      `🏦 Starting Abyssinia verification for reference: ${reference}, suffix: ${suffix}`,
    );

    const apiUrl = `https://cs.bankofabyssinia.com/api/onlineSlip/getDetails/?id=${reference}${suffix}`;
    logger.info(`📡 Fetching transaction from URL: ${apiUrl}`);

    const response = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    logger.info(`✅ Response status: ${response.status}`);
    logger.debug(
      `📋 Response headers: ${JSON.stringify(response.headers, null, 2)}`,
    );

    const data = response.data;
    logger.debug(
      `📄 Response body preview: ${JSON.stringify(data).slice(0, 1000)}`,
    );

    if (!data || !data.header || !data.body || !Array.isArray(data.body)) {
      logger.error("❌ Invalid response structure from Abyssinia API");
      return {
        success: false,
        error: "Invalid response structure from Abyssinia API",
      };
    }

    if (data.header.status !== "success") {
      logger.error(`❌ API returned error status: ${data.header.status}`);
      return {
        success: false,
        error: `API returned error status: ${data.header.status}`,
      };
    }

    if (data.body.length === 0) {
      logger.error("❌ No transaction data found in response body");
      return {
        success: false,
        error: "No transaction data found in response body",
      };
    }

    const transaction = data.body[0];
    logger.debug(
      `📋 Transaction raw data: ${JSON.stringify(transaction, null, 2)}`,
    );

    const amountStr =
      transaction["Transferred Amount"] || transaction.transferredAmount || "";
    const transferredAmount = parseFloat(amountStr.replace(/[^\d.]/g, ""));
    const dateStr =
      transaction["Transaction Date"] || transaction.transactionDate;
    const transactionDate = dateStr ? new Date(dateStr) : undefined;

    const receipt: AbyssiniaReceipt = {
      payerName: transaction["Payer's Name"] || transaction.payerName || "",
      sourceAccount:
        transaction["Source Account"] || transaction.sourceAccount || "",
      sourceAccountName:
        transaction["Source Account Name"] ||
        transaction.sourceAccountName ||
        "",
      transferredAmount,
      transactionReference:
        transaction["Transaction Reference"] ||
        transactionReference ||
        reference,
      transactionDate: transactionDate!,
      narrative: transaction.Narrative || transaction.narrative || null,
      vat: transaction.VAT || transaction.vat,
      totalAmountIncludingVAT:
        transaction["Total Amount Including VAT"] ||
        transaction.totalAmountIncludingVAT,
      serviceCharge: transaction["Service Charge"] || transaction.serviceCharge,
      transactionType:
        transaction["Transaction Type"] || transaction.transactionType,
      tel: transaction.Tel || transaction.tel,
      address: transaction.Address || transaction.address,
    };

    logger.debug("🔄 Mapping fields to VerifyResult...");
    const result: VerifyResult = {
      success: true,
      payer: receipt.payerName,
      payerAccount: receipt.sourceAccount,
      receiver: receipt.sourceAccountName,
      receiverAccount: undefined,
      amount: receipt.transferredAmount,
      date: receipt.transactionDate,
      reference: receipt.transactionReference,
      reason: receipt.narrative,
    };

    if (
      !result.reference ||
      !result.amount ||
      !result.payer ||
      !result.receiver
    ) {
      logger.error("❌ Essential fields missing in transaction data", result);
      return { success: false, error: "Missing essential transaction fields" };
    }

    logger.info(
      `✅ Successfully verified Abyssinia transaction: ${result.reference}`,
    );
    logger.debug(
      `💰 Key details - Amount: ${result.amount}, Payer: ${result.payer}, Date: ${result.date}`,
    );

    return result;
  } catch (error) {
    if (error instanceof AxiosError) {
      logger.error(
        `❌ HTTP Error fetching Abyssinia receipt: ${error.message}`,
      );
      if (error.response) {
        logger.error(
          `📊 Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
        );
      }
    } else {
      logger.error("❌ Unexpected error in verifyAbyssinia:", error);
    }
    return { success: false, error: "Failed to verify Abyssinia transaction" };
  }
}
