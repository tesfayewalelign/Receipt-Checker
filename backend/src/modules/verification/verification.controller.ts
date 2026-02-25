import { Request, Response } from "express";
import { VerificationService, VerifyPayload } from "./verification.service";
import { handleResponse } from "../../utils/response";
import { BankType } from "../../verifiers/bank.verifier";
import { TelebirrVerifier } from "../../verifiers/telebirr.verifier";

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
    const {
      bank,
      reference,
      accountSuffix,
      receiptNumber,
      phoneNumber,
      apiKey,
    } = req.body;
    const file = (req as MulterRequest).file;

    if (!bank) {
      return handleResponse(res, null, "Bank is required", false);
    }

    const normalizedBank = bank?.trim().toUpperCase();

    if (!Object.values(BankType).includes(normalizedBank as BankType)) {
      return handleResponse(res, null, `Bank ${bank} is not supported`, false);
    }

    try {
      let payload: VerifyPayload = {};

      if (file) {
        payload.fileBuffer = file.buffer!;
        payload.fileType = file.mimetype.includes("pdf") ? "pdf" : "image";
      }

      if (reference !== undefined) payload.reference = reference;
      if (accountSuffix !== undefined) payload.accountSuffix = accountSuffix;

      if (normalizedBank === BankType.CBEBIRR) {
        payload.receiptNumber = receiptNumber;
        payload.phoneNumber = phoneNumber;
        payload.apiKey = apiKey;
      }

      const result = await VerificationService.verifyReceipt(
        normalizedBank,
        payload,
      );

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
