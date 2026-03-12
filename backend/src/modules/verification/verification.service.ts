import logger from "../../utils/logger";
import { verifyAwash } from "../../verifiers/awash.verifier";
import { BankType, verifyByBank } from "../../verifiers/bank.verifier";
import { VerifyResult } from "../../verifiers/cbe.verifier";
import { verifyDashen } from "../../verifiers/dashen.verifier";
import { verifyCBEBirr } from "../../verifiers/cbebirr.verifier";
import { verifyTelebirr } from "../../verifiers/telebirr.verifier";

export interface VerifyPayload {
  pdfBuffer?: Buffer;
  fileBuffer?: Buffer;
  filePath?: string;
  reference?: string;
  accountSuffix?: string;
  fileType?: "pdf" | "image";
  receiptNumber?: string;
  phoneNumber?: string;
  apiKey?: string;
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

      case BankType.TELEBIRR: {
        const hasReference = !!payload.reference?.trim();
        const hasFile = !!payload.fileBuffer;

        if (!hasReference && !hasFile) {
          return {
            success: false,
            error: "Provide transaction reference or receipt file",
          };
        }

        return await verifyTelebirr({
          reference: payload.reference,
          fileBuffer: payload.fileBuffer,
          fileType: payload.fileType,
        });
      }

      case BankType.ABYSSINIA: {
        if (!payload.accountSuffix) {
          return {
            success: false,
            error: "Account suffix is required for Abyssinia",
          };
        }

        const hasFile = !!payload.fileBuffer || !!payload.filePath;

        if (!payload.reference && !hasFile) {
          return {
            success: false,
            error:
              "Provide transaction reference or upload receipt file (PDF/image)",
          };
        }

        if (payload.fileBuffer && !payload.fileType) {
          return {
            success: false,
            error: "File type must be specified (pdf or image)",
          };
        }

        break;
      }

      case BankType.DASHEN: {
        const hasReference = !!payload.reference?.trim();
        const hasFile = !!payload.fileBuffer || !!payload.filePath;

        if (!hasReference && !hasFile) {
          return {
            success: false,
            error: "Provide transaction reference or receipt file",
          };
        }

        return await verifyDashen(payload);
      }

      case BankType.AWASH: {
        const reference = payload.reference?.trim();

        if (!reference) {
          return {
            success: false,
            error: "Transaction reference is required for Awash Bank",
          };
        }

        return await verifyAwash({ reference });
      }
      case BankType.CBEBIRR: {
        const phoneNumber = payload.phoneNumber?.trim();
        const receiptNumber = payload.receiptNumber?.trim();
        const filePath = payload.filePath;

        const hasPhone = !!phoneNumber;
        const hasReceipt = !!receiptNumber;
        const hasFile = !!filePath;

        if (!hasPhone) {
          return {
            success: false,
            error: "phoneNumber is required for CBEBirr verification",
          };
        }

        if (!hasReceipt && !hasFile) {
          return {
            success: false,
            error:
              "Provide either receiptNumber or a file for CBEBirr verification",
          };
        }

        if (hasReceipt) {
          return await verifyCBEBirr({
            receiptNumber,
            phoneNumber,
            apiKey: process.env.CBE_API_KEY || "",
          });
        }

        if (hasFile) {
          if (!payload.fileType) {
            return {
              success: false,
              error: "fileType is required when uploading a file",
            };
          }

          return await verifyCBEBirr({
            phoneNumber,
            apiKey: process.env.CBE_API_KEY || "",
            filePath,
          });
        }

        return {
          success: false,
          error: "Invalid CBEBirr verification input",
        };
      }

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
