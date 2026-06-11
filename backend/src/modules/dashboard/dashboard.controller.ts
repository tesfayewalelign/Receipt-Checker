import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { getKpisService } from "./dashboard.service";

export const getKpis = async (req: Request, res: Response) => {
  try {
    const data = await getKpisService();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
