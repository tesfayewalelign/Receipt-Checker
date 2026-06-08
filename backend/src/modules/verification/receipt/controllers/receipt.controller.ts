import { Request, Response } from "express";
import { ReceiptService } from "../services/receipt.service";
import { normalize } from "../../../../utils/receiptNormalizer";

export class ReceiptController {
  static async verify(req: Request, res: Response) {
    const { bank } = req.body;

    const result = await ReceiptService.verify(bank, req.body);

    const normalized = normalize(bank, result);

    return res.json({
      success: true,
      data: normalized,
    });
  }
}
