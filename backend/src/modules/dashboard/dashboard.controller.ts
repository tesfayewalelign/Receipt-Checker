import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  static async getReceipts(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const data = await DashboardService.getReceipts(userId);

    return res.json({
      success: true,
      data,
    });
  }

  static async getApiKeys(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const data = await DashboardService.getApiKeys(userId);

    res.json({
      success: true,
      data,
    });
  }
}
