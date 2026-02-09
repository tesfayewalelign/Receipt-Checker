import { VerifyResult } from "./cbe.verifier";
import { verifyCBE } from "./cbe.verifier";

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

    default:
      return { success: false, error: "Unsupported bank" };
  }
}
