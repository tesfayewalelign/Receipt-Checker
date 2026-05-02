import { Request, Response } from "express";

import { verifyCBE } from "../../../verifiers/cbe.verifier";
import { verifyTelebirr } from "../../../verifiers/telebirr.verifier";
import { verifyAbyssinia } from "../../../verifiers/abyssinia.verifier";

export const verifyReceipt = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    const type = body.type;
    const reference = body.reference;
    const accountSuffix = body.accountSuffix;
    const phoneNumber = body.phoneNumber;
    const receiptNumber = body.receiptNumber;

    const file = (req as any).file;

    const fileBuffer = file?.buffer;
    const fileType = file
      ? file.mimetype.includes("pdf")
        ? "pdf"
        : "image"
      : undefined;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "type is required",
      });
    }

    let result;

    switch (type.toLowerCase()) {
      case "cbe":
        result = await verifyCBE({
          reference,
          fileBuffer,
          fileType,
        });
        break;

      case "telebirr":
        result = await verifyTelebirr({
          reference,
          fileBuffer,
          fileType,
        });
        break;

      case "abyssinia":
        result = await verifyAbyssinia({
          reference,
          accountSuffix,
          fileBuffer,
          fileType,
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported receipt type",
        });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
};
