import { Request, Response } from "express";
import { auth } from "../../lib/auth";
import { HistoryService } from "./history.service";

export const getHistory = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as HeadersInit),
    });

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const receipts = await HistoryService.getUserHistory(session.user.id);

    return res.json({
      success: true,
      count: receipts.length,
      data: receipts,
    });
  } catch (error) {
    console.error("History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch history",
    });
  }
};

export const getHistoryDetail = async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as HeadersInit),
    });

    if (!session?.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const receiptId = Number(req.params.id);

    const receipt = await HistoryService.getReceiptById(
      receiptId,
      session.user.id,
    );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    return res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    console.error("Receipt Detail Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch receipt",
    });
  }
};
