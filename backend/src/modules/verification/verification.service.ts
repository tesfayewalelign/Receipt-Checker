import logger from "../../utils/logger";
import { BankType, verifyByBank } from "../../verifiers/bank.verifier";
import { VerifyResult } from "../../verifiers/cbe.verifier";

export interface VerifyPayload {
  pdfBuffer?: Buffer;
  fileBuffer?: Buffer;
  filePath?: string;
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

    switch (bank) {
      case BankType.CBE:
        if (
          !payload.fileBuffer &&
          (!payload.reference || !payload.accountSuffix)
        ) {
          return {
            success: false,
            error: "Provide PDF file or reference with account suffix",
          };
        }
        break;

      case BankType.TELEBIRR:
        if (!payload.reference && !payload.pdfBuffer) {
          return {
            success: false,
            error: "Provide transaction reference or receipt file",
          };
        }
        break;

      case BankType.ABYSSINIA:
        if (!payload.accountSuffix) {
          return {
            success: false,
            error: "Account suffix is required for Abyssinia",
          };
        }

        if (!payload.reference && !payload.pdfBuffer) {
          return {
            success: false,
            error: "Provide transaction reference or receipt file",
          };
        }
        break;

      case BankType.DASHEN:
        if (!payload.reference && !payload.pdfBuffer) {
          return {
            success: false,
            error: "Provide transaction reference or receipt file",
          };
        }
        break;
      case BankType.MPESA:
        if (!payload.reference && !payload.fileBuffer && !payload.filePath) {
          return {
            success: false,
            error: "Provide transaction reference or receipt file",
          };
        }
        break;

      default:
        return {
          success: false,
          error: "Unsupported bank",
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
