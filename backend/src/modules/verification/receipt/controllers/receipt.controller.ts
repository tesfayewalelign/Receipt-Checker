import { Request, Response } from "express";
import { ReceiptService } from "../services/receipt.service";
import { saveReceiptIfLoggedIn } from "../services/receipt.service";

type MulterRequest = Request & { file?: Express.Multer.File };

export class ReceiptController {
  static async verify(req: Request, res: Response) {
    try {
      const { bank } = req.body;

      const incomingFile = (req as MulterRequest).file;
      console.log("========== RECEIPT VERIFY REQUEST ==========");
      console.log("[ReceiptController] bank:", bank);
      console.log("[ReceiptController] file received:", !!incomingFile);
      console.log("[ReceiptController] file size (bytes):", incomingFile?.size ?? 0);
      console.log("[ReceiptController] file mimetype:", incomingFile?.mimetype ?? "(none)");
      console.log("[ReceiptController] typed reference:", req.body.reference ?? "(none)");
      console.log("[ReceiptController] accountSuffix:", req.body.accountSuffix ?? "(none)");
      console.log("============================================");

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
