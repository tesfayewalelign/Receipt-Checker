import { Request, Response, NextFunction } from "express";
import prisma from "../../config/database";

export interface ApiKeyRequest extends Request {
  user?: any;
  apiKey?: any;
}

export const apiKeyMiddleware = async (
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const key = req.header("x-api-key");

    if (!key) {
      return res.status(401).json({
        success: false,
        message: "API key required",
      });
    }

    const keyRecord = await prisma.apiKey.findUnique({
      where: { key },
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
        message: "API key is not active",
      });
    }

    req.user = keyRecord.user;
    req.apiKey = keyRecord;

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "API key validation failed",
    });
  }
};
