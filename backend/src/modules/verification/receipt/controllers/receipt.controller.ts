import { Request, Response } from "express";
import { ReceiptService } from "../services/receipt.service";

export class ReceiptController {
  static async verify(req: Request, res: Response) {
    const { bank } = req.body;

    const result = await ReceiptService.verify(bank, req.body);

    return res.json(result);
  }
}
