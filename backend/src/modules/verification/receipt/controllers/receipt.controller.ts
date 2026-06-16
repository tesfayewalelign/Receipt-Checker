import { Request, Response } from "express";
import { ReceiptService } from "../services/receipt.service";
import { saveReceiptIfLoggedIn } from "../services/receipt.service";

type MulterRequest = Request & { file?: Express.Multer.File };

export class ReceiptController {
  static async verify(req: Request, res: Response) {
    try {
      const { bank } = req.body;

      if (!bank) {
        return res.status(400).json({
          success: false,
          error: "Bank is required",
        });
      }

      // Start from the typed fields (reference, accountSuffix, phoneNumber …).
      // When the user uploaded a receipt instead, attach the file so the bank
      // verifiers can extract the reference from it (OCR for images, pdfjs for
      // PDFs). Without this the file never reached the verifier and every
      // upload failed with "Unsupported provider".
      const payload: any = { ...req.body };
      const file = (req as MulterRequest).file;

      if (file?.buffer) {
        payload.fileBuffer = file.buffer;
        payload.fileType =
          file.mimetype === "application/pdf" ? "pdf" : "image";
      }

      const result = await ReceiptService.verify(bank, payload);
      await saveReceiptIfLoggedIn(req, result, bank);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
