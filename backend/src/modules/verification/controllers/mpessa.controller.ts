import { Request, Response } from "express";
import { handleResponse } from "../../../utils/response";
import { MPesaService } from "../services/mpessa.service";

type MulterRequest = Request & { file?: Express.Multer.File };

export class MPesaController {
  static async verify(req: Request, res: Response) {
    const { reference } = req.body;
    const file = (req as MulterRequest).file;

    if (!reference && !file) {
      return handleResponse(res, null, "Reference or file is required", false);
    }

    try {
      const result = await MPesaService.verify({
        reference,
        fileBuffer: file?.buffer,
        fileType: file
          ? file.mimetype.includes("pdf")
            ? "pdf"
            : "image"
          : undefined,
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
