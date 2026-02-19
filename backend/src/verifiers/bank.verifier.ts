import { VerifyResult } from "./cbe.verifier";
import { verifyCBE } from "./cbe.verifier";
import { verifyTelebirr } from "./telebirr.verifier";
import { verifyAbyssinia } from "./abyssinia.verifier";
import { verifyDashen } from "./dashen.verifier";
import { verifyMPesa } from "./mpesa.verifier";
export enum BankType {
  CBE = "CBE",
  TELEBIRR = "TELEBIRR",
  DASHEN = "DASHEN",
  ABYSSINIA = "ABYSSINIA",
  MPESA = "MPESA",
}

export async function verifyByBank(
  bank: BankType,
  payload: any,
): Promise<VerifyResult> {
  switch (bank) {
    case BankType.CBE:
      return verifyCBE(payload);

    case BankType.TELEBIRR:
      if (!payload.reference) {
        return { success: false, error: "Reference is required for Telebirr" };
      }
      return verifyTelebirr(payload.reference);

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

      return verifyAbyssinia({
        reference: payload.reference,
        accountSuffix: payload.accountSuffix,
        filePath: payload.filePath,
      });

    case BankType.DASHEN:
      if (!payload.reference) {
        return { success: false, error: "Reference is required for Dashen" };
      }
      return verifyDashen(payload.reference);

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
