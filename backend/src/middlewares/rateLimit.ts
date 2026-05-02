import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthenticatedRequest } from "./apiKey.middleware";

export const rateLimitMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.apiKey;

    // ✅ Safety check (VERY IMPORTANT)
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key not found on request",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.usageLog.count({
      where: {
        userId: apiKey.userId,
        createdAt: {
          gte: today,
        },
      },
    });

    if (count >= apiKey.dailyLimit) {
      return res.status(429).json({
        success: false,
        message: "Daily limit exceeded",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Rate limit check failed",
    });
  }
};
