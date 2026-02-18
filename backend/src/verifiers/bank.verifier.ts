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
      if (!payload.reference || !payload.accountSuffix) {
        return {
          success: false,
          error: "Reference and account suffix are required for Abyssinia",
        };
      }
      return verifyAbyssinia(payload.reference, payload.accountSuffix);

    case BankType.DASHEN:
      if (!payload.reference) {
        return { success: false, error: "Reference is required for Dashen" };
      }
      return verifyDashen(payload.reference);

    case BankType.MPESA:
      if (!payload.reference) {
        return { success: false, error: "Reference is required for MPESA" };
      }
      return verifyMPesa(payload);

    default:
      return { success: false, error: `Unsupported bank: ${bank}` };
  }
}
