import { TelebirrService } from "../../services/telebirr.service";
import { CBEBirrService } from "../../services/cbeBirr.service";
import { AwashService } from "../../services/awash.service";
import { CBEVerificationService } from "../../services/cbe.service";
import { DashenService } from "../../services/dashn.service";
import { AbyssiniaService } from "../../services/abyssinia.service";
import { MPesaService } from "../../services/mpessa.service";

import { normalizeReceipt } from "../../../../utils/receiptNormalizer";
import prisma from "../../../../config/database";
import auth from "../../../../lib/auth";

export class ReceiptService {
  static async verify(bank: string, payload: any) {
    let rawResult: any;

    switch (bank) {
      case "telebirr":
        rawResult = await TelebirrService.verify(payload);
        break;

      case "cbe-birr":
        rawResult = await CBEBirrService.verify({
          ...payload,
          reference: payload.reference || payload.receiptNumber,
        });
        break;

      case "awash":
        rawResult = await AwashService.verify(payload);
        break;

      case "cbe":
        rawResult = await CBEVerificationService.verify(payload);
        break;

      case "dashen":
        rawResult = await DashenService.verify(payload);
        break;

      case "boa":
        rawResult = await AbyssiniaService.verify(payload);
        break;

      case "mpesa":
        rawResult = await MPesaService.verify(payload);
        break;

      default:
        throw new Error("Unsupported provider");
    }

    // ❗ IMPORTANT: never normalize failed results
    if (!rawResult?.success) {
      return {
        success: false,
        message: rawResult?.error || "Verification failed",
        data: null,
      };
    }

    const normalized = normalizeReceipt(bank, rawResult);

    return {
      success: true,
      data: normalized,
    };
  }
}

/**
 * Save receipt only if user is logged in
 */
export const saveReceiptIfLoggedIn = async (
  req: any,
  result: any,
  bank: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as HeadersInit),
  });

  if (!session?.user?.id) return;

  await prisma.receiptLog.create({
    data: {
      userId: session.user.id,
      reference: result.data?.reference ?? null,
      amount: result.data?.amount ?? null,
      status: result.success ? "verified" : "failed",
      provider: bank,
    },
  });
};
