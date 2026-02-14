import { VerifyResult } from "./cbe.verifier";
import { verifyCBE } from "./cbe.verifier";
import { verifyTelebirr } from "./telebirr.verifier";

export enum BankType {
  CBE = "CBE",
  TELEBIRR = "TELEBIRR",
  DASHEN = "DASHEN",
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

    default:
      return { success: false, error: "Unsupported bank" };
  }
}
