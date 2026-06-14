import { TelebirrService } from "../../services/telebirr.service";
import { CBEBirrService } from "../../services/cbeBirr.service";
import { AwashService } from "../../services/awash.service";
import { CBEVerificationService } from "../../services/cbe.service";
import { DashenService } from "../../services/dashn.service";
import { AbyssiniaService } from "../../services/abyssinia.service";
import { MPesaService } from "../../services/mpessa.service";
import { normalizeReceipt } from "../../../../utils/receiptNormalizer";
import { Prisma } from "../../../../generated/prisma";
import prisma from "../../../../config/database";
import auth from "../../../../lib/auth";

export class ReceiptService {
  static async verify(bank: string, payload: any) {
    let rawResult;

    switch (bank) {
      case "telebirr":
        rawResult = await TelebirrService.verify(payload);

        break;

      case "cbe-birr":
        rawResult = await CBEBirrService.verify(payload);

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
        console.log("========== MPESA RAW RESULT ==========");
        console.log(JSON.stringify(rawResult, null, 2));
        console.log("======================================");
        break;

      case "mpesa":
        rawResult = await MPesaService.verify(payload);

        break;

      default:
        throw new Error("Unsupported provider");
    }

    const normalized = normalizeReceipt(bank, rawResult);
    console.log("========== NORMALIZED RESULT ==========");
    console.log(JSON.stringify(normalized, null, 2));
    console.log("=======================================");

    return {
      success: rawResult.success,
      data: normalized,
    };
  }
}
export const saveReceiptIfLoggedIn = async (
  req: any,
  result: any,
  bank: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as HeadersInit),
  });

  if (!session?.user?.id) {
    console.log("Guest user - not saving receipt");
    return;
  }

  const receipt = await prisma.receiptLog.create({
    data: {
      userId: session.user.id,
      reference: result.data.reference,
      amount: result.data.amount,
      status: result.success ? "verified" : "failed",
      provider: bank,
    },
  });

  console.log("Receipt saved:", receipt.id);
};
