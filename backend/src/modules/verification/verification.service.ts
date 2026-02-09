import { VerifyResult } from "../../verifiers/cbe.verifier";
import { verifyCBE } from "../../verifiers/cbe.verifier";
import { BankType } from "../../verifiers/bank.verifier";
import logger from "../../utils/logger";

export class VerificationService {
  static async verifyReceipt(
    bank: BankType,
    reference: string,
    accountSuffix: string,
  ): Promise<VerifyResult> {
    logger.info(
      `Starting verification for bank: ${bank}, reference: ${reference}`,
    );

    switch (bank) {
      case BankType.CBE:
        return await verifyCBE(reference, accountSuffix);

      default:
        return { success: false, error: `Bank ${bank} not supported yet` };
    }
  }
}
