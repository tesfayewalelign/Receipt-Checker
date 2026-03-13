import { Request, Response } from "express";
import { CBEVerificationService } from "../services/cbe.service";
import { handleResponse } from "../../../utils/response";

export default class CBEController {
  static async verify(req: Request, res: Response) {
    try {
      const body = req.body || {};

      const reference = body.reference;
      const accountSuffix = body.accountSuffix;

      const file = (req as any).file;

      let fileType: "pdf" | "image" | undefined;

      if (file) {
        if (file.mimetype === "application/pdf") {
          fileType = "pdf";
        } else if (file.mimetype.startsWith("image/")) {
          fileType = "image";
        }
      }

      const result = await CBEVerificationService.verify({
        reference,
        accountSuffix,
        fileBuffer: file?.buffer,
        fileType,
      });

      return handleResponse(res, result.data, result.error, result.success);
    } catch (err: any) {
      return handleResponse(res, null, err.message, false);
    }
  }
}
