import { Request, Response } from "express";
import { verifyReceiptService } from "../services/receipt.service";

export const verifyReceiptController = async (req: Request, res: Response) => {
  try {
    const { bank } = req.body;

    if (!bank) {
      return res.status(400).json({
        success: false,
        message: "Bank is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Receipt file is required",
      });
    }

    const result = await verifyReceiptService(bank, req.file.buffer);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
