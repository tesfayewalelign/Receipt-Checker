import prisma from "../../config/database";
import { verifyCBE, VerifyResult } from "../../verifiers/cbe.verifier";
import logger from "../../utils/logger";

const toNullable = <T>(value: T | undefined | null): T | null => {
  return value !== undefined ? value : null;
};

export class VerificationService {
  static async verifyCBEReceipt(reference: string, accountSuffix: string) {
    const cbeBank = await prisma.bank.findUnique({ where: { code: "CBE" } });
    if (!cbeBank) throw new Error("CBE Bank not found in DB");

    const result: VerifyResult = await verifyCBE(reference, accountSuffix);

    const verification = await prisma.verification.create({
      data: {
        bankId: cbeBank.id,
        reference,
        provider: "CBE",
        status: result.success ? "verified" : "failed",
        amount: toNullable(result.amount),
        transactionDate: toNullable(result.date ? new Date(result.date) : null),
        rawData: { ...result },
      },
    });

    logger.info(`Verification saved: ${verification.id}`);
    return verification;
  }
}
