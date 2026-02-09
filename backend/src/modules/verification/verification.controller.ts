import { Request, Response } from "express";
import { VerificationService } from "./verification.service";
import { handleResponse } from "../../utils/response";
import { BankType } from "../../verifiers/bank.verifier";

export class VerificationController {
  static async verify(req: Request, res: Response) {
    const { bank, reference, accountSuffix } = req.body;

    if (!bank || !reference || !accountSuffix) {
      return handleResponse(
        res,
        null,
        "Bank, reference, and account suffix are required",
        false,
      );
    }

    if (!Object.values(BankType).includes(bank)) {
      return handleResponse(res, null, `Bank ${bank} is not supported`, false);
    }

    try {
      const verification = await VerificationService.verifyReceipt(
        bank,
        reference,
        accountSuffix,
      );

      if (!verification.success) {
        return handleResponse(res, verification, verification.error, false);
      }

      return handleResponse(
        res,
        verification.data,
        "Verification completed successfully",
        true,
      );
    } catch (err: any) {
      return handleResponse(res, null, err.message, false);
    }
  }
}
