import { Request, Response } from "express";
import { ReceiptService } from "../services/receipt.service";
import { saveReceiptIfLoggedIn } from "../services/receipt.service";

export class ReceiptController {
  static async verify(req: Request, res: Response) {
    try {
      const { bank } = req.body;

      const result = await ReceiptService.verify(bank, req.body);
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
