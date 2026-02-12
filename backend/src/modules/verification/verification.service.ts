import logger from "../../utils/logger";
import { BankType, verifyByBank } from "../../verifiers/bank.verifier";
import { VerifyResult } from "../../verifiers/cbe.verifier";

export interface VerifyPayload {
  pdfBuffer?: Buffer;
  reference?: string;
  accountSuffix?: string;
  fileType?: "pdf" | "image";
}

export class VerificationService {
  static async verifyReceipt(
    bank: BankType,
    payload: VerifyPayload,
  ): Promise<VerifyResult> {
    logger.info(`Starting verification for bank: ${bank}`);

    if (!payload.pdfBuffer && (!payload.reference || !payload.accountSuffix)) {
      logger.warn("No PDF or reference/suffix provided");
      return {
        success: false,
        error: "Provide PDF file or reference with account suffix",
      };
    }

    try {
      const result = await verifyByBank(bank, payload);
      logger.info(
        `Verification result for bank ${bank}: ${result.success ? "SUCCESS" : "FAILED"}`,
      );
      return result;
    } catch (err: any) {
      logger.error(`Verification failed for bank ${bank}: ${err.message}`);
      return { success: false, error: err.message || "Verification failed" };
    }
  }
}
