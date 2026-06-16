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
        // The verify form labels this field "Receipt Number" and the provider
        // config names it `receiptNumber`, but the verifier reads `reference`.
        // Accept either so a typed receipt number isn't silently dropped.
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

    console.log("========== RAW VERIFIER RESULT ==========");
    console.log("[ReceiptService] bank:", bank);
    console.log("[ReceiptService] success:", rawResult?.success);
    console.log("[ReceiptService] error:", rawResult?.error ?? "(none)");
    console.log("[ReceiptService] has data:", !!(rawResult as any)?.data);
    console.log("=========================================");

    // When the verifier failed, do NOT normalize (normalize maps over a
    // missing rawResult.data, producing an all-undefined object that
    // JSON.stringify collapses to `{}` — the mysterious `{ success:false,
    // data:{} }`). Instead surface the real reason the verifier reported.
    if (!rawResult?.success) {
      return {
        success: false,
        message: rawResult?.error || "Verification failed",
        data: null,
      };
    }

    const normalized = normalizeReceipt(bank, rawResult);
    console.log("========== NORMALIZED RESULT ==========");
    console.log(JSON.stringify(normalized, null, 2));
    console.log("=======================================");

    return {
      success: true,
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

  // result.data is null on every failed verification (see ReceiptService.verify),
  // so read every field through optional chaining + nullish fallback. Never touch
  // result.data.* directly — that is what threw "Cannot read properties of null".
  const receipt = await prisma.receiptLog.create({
    data: {
      userId: session.user.id,
      reference: result.data?.reference ?? null,
      amount: result.data?.amount ?? null,
      status: result.success ? "verified" : "failed",
      provider: bank,
    },
  });

  console.log("Receipt saved:", receipt.id);
};
