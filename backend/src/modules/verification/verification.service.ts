import prisma from "../../config/database";
import { verifyCBE, VerifyResult } from "../../verifiers/cbe.verifier";
import logger from "../../utils/logger";

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
        status: result.success ? "success" : "failed",
        payerName: result.payer,
        payerAccount: result.payerAccount,
        receiverName: result.receiver,
        receiverAccount: result.receiverAccount,
        amount: result.amount,
        transactionDate: result.date,
        rawData: result,
      },
    });

    logger.info("Verification saved:", verification.id);
    return verification;
  }
}
