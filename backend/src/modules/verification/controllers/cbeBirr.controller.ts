import { Request, Response } from "express";
import { handleResponse } from "../../../utils/response";
import { CBEBirrService } from "../services/cbeBirr.service";

type MulterRequest = Request & { file?: Express.Multer.File };

export class CBEBirrController {
  static async verify(req: Request, res: Response) {
    const r = req as MulterRequest;
    const phoneNumber = r.body.phoneNumber || r.body.phone;
    const reference = r.body.reference;
    const fileBuffer = r.file?.buffer;
    const fileType = r.file
      ? r.file.mimetype.includes("pdf")
        ? "pdf"
        : "image"
      : undefined;

    if (!phoneNumber) {
      return handleResponse(res, null, "Phone number is required", false);
    }

    try {
      const result = await CBEBirrService.verify({
        reference,
        phoneNumber,
        fileBuffer,
        fileType,
      });

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
