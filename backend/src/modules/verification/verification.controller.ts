import { Request, Response } from "express";
import { VerificationService } from "./verification.service";
import { handleResponse } from "../../utils/response";
import { BankType } from "../../verifiers/bank.verifier";

type MulterRequest = Request & {
  file?: Express.Multer.File;
};

export class VerificationController {
  static async verify(req: Request, res: Response) {
    const file = (req as MulterRequest).file;

    const { bank, reference, accountSuffix } = req.body;

    if (!bank) {
      return handleResponse(res, null, "Bank is required", false);
    }

    if (!Object.values(BankType).includes(bank)) {
      return handleResponse(res, null, `Bank ${bank} is not supported`, false);
    }

    if (!file && (!reference || !accountSuffix)) {
      return handleResponse(
        res,
        null,
        "Provide PDF file or reference with account suffix",
        false,
      );
    }

    try {
      const result = await VerificationService.verifyReceipt(bank, {
        pdfBuffer: file?.buffer,
        reference,
        accountSuffix,
      });

      if (!result.success) {
        return handleResponse(res, result, result.error, false);
      }

      return handleResponse(
        res,
        result.data,
        "Verification completed successfully",
        true,
      );
    } catch (err: any) {
      return handleResponse(
        res,
        null,
        err.message || "Verification failed",
        false,
      );
    }
  }
}
