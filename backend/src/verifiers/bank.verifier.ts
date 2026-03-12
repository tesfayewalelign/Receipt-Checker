import { VerifyResult } from "./cbe.verifier";
import { verifyCBE } from "./cbe.verifier";
import { verifyTelebirr } from "./telebirr.verifier";
import { verifyAbyssinia } from "./abyssinia.verifier";
import { verifyDashen } from "./dashen.verifier";
import { verifyMPesa } from "./mpesa.verifier";
import { verifyAwash } from "./awash.verifier";
import { verifyCBEBirr } from "./cbebirr.verifier";
export enum BankType {
  CBE = "CBE",
  TELEBIRR = "TELEBIRR",
  DASHEN = "DASHEN",
  ABYSSINIA = "ABYSSINIA",
  MPESA = "MPESA",
  AWASH = "AWASH",
  CBEBIRR = "CBEBIRR",
}

export async function verifyByBank(
  bank: BankType,
  payload: any,
): Promise<VerifyResult> {
  switch (bank) {
    case BankType.CBE:
      return verifyCBE(payload);

    case BankType.TELEBIRR: {
      const hasReference = !!payload.reference?.trim();
      const hasFile = !!payload.fileBuffer || !!payload.filePath;

      if (!hasReference && !hasFile) {
        return {
          success: false,
          error: "Provide transaction reference or receipt file",
        };
      }

      return verifyTelebirr({
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

      if (!payload.reference && !payload.filePath && !payload.fileBuffer) {
        return {
          success: false,
          error: "Provide transaction reference or upload receipt file",
        };
      }

      return verifyAbyssinia({
        reference: payload.reference,
        accountSuffix: payload.accountSuffix,
        filePath: payload.filePath,
        fileBuffer: payload.fileBuffer,
        fileType: payload.fileType,
      });
    }

    case BankType.DASHEN:
      return await verifyDashen({
        reference: payload.reference,
        fileBuffer: payload.fileBuffer,
        filePath: payload.filePath,
        fileType: payload.fileType,
      });
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
      const { receiptNumber, phoneNumber, fileType, accountSuffix, filePath } =
        payload;

      const hasPhone = !!phoneNumber?.trim();
      const hasReceipt = !!receiptNumber?.trim();
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
          receiptNumber: receiptNumber!.trim(),
          phoneNumber: phoneNumber!.trim(),
          apiKey: process.env.CBE_API_KEY || "",
        });
      }

      if (hasFile) {
        if (!fileType) {
          return {
            success: false,
            error: "fileType is required when uploading a file",
          };
        }

        if (!accountSuffix?.trim()) {
          return {
            success: false,
            error: "accountSuffix is required when uploading a file",
          };
        }

        return await verifyCBEBirr({
          phoneNumber: phoneNumber!.trim(),
          apiKey: process.env.CBE_API_KEY || "",
          filePath: filePath,
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
          error: "Reference or file is required for MPESA",
        };
      }
      return verifyMPesa(payload);

    default:
      return { success: false, error: `Unsupported bank: ${bank}` };
  }
}
