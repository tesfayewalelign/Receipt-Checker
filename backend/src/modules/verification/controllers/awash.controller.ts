import { Request, Response } from "express";
import { handleResponse } from "../../../utils/response";
import { AwashService } from "../services/awash.service";

type MulterFile = {
  buffer?: Buffer;
};

type MulterRequest = Request & { file?: MulterFile };

export default class AwashController {
  static async verify(req: Request, res: Response) {
    const { reference } = req.body;
    const file = (req as MulterRequest).file;

    try {
      const payload: { reference?: string; fileBuffer?: Buffer } = {};
      if (reference) payload.reference = reference;
      if (file?.buffer) payload.fileBuffer = file.buffer;

      const result = await AwashService.verify(payload);

      if (!result.success) {
        return handleResponse(res, result, result.error, false);
      }

      return handleResponse(
        res,
        result,
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
