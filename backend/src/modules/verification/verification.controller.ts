import { Request, Response } from "express";
import { VerificationService } from "./verification.service";
import { handleResponse } from "../../utils/response";

export class VerificationController {
  static async verifyCBE(req: Request, res: Response) {
    const { reference, accountSuffix } = req.body;
    if (!reference || !accountSuffix)
      return handleResponse(
        res,
        null,
        "Reference and account suffix are required",
        false,
      );

    try {
      const verification = await VerificationService.verifyCBEReceipt(
        reference,
        accountSuffix,
      );
      return handleResponse(
        res,
        verification,
        "Verification completed successfully",
        true,
      );
    } catch (err: any) {
      return handleResponse(res, null, err.message, false);
    }
  }
}
