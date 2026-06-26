import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export interface AuthenticatedRequest extends Request {
  user?: Awaited<ReturnType<typeof prisma.user.findUnique>>;

  apiKey?: Awaited<ReturnType<typeof prisma.apiKey.findUnique>>;
}
export const apiKeyMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key is required",
      });
    }

    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!keyRecord) {
      return res.status(403).json({
        success: false,
        message: "Invalid API key",
      });
    }

    if (keyRecord.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "API key is disabled",
      });
    }

    req.user = keyRecord.user;
    req.apiKey = keyRecord;

    next();
  } catch (error) {
    console.error("API KEY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
