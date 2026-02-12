import { Request, Response } from "express";
import { VerificationService, VerifyPayload } from "./verification.service";
import { handleResponse } from "../../utils/response";
import { BankType } from "../../verifiers/bank.verifier";

type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
};

type MulterRequest = Request & {
  file?: MulterFile;
};

export class VerificationController {
  static async verify(req: Request, res: Response) {
    const { bank, reference, accountSuffix } = req.body;
    const file = (req as MulterRequest).file;

    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

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

    if (!accountSuffix) {
      return handleResponse(res, null, "accountSuffix is required", false);
    }

    try {
      let payload: VerifyPayload;

      if (file) {
        // ✅ Include fileType so verifyCBE knows to extract reference from PDF
        payload = { pdfBuffer: file.buffer!, fileType: "pdf", accountSuffix };
      } else {
        // Manual reference provided
        payload = {
          reference: reference as string,
          accountSuffix: accountSuffix as string,
        };
      }

      const result = await VerificationService.verifyReceipt(bank, payload);

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
