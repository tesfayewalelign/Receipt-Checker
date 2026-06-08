import { TelebirrService } from "../../services/telebirr.service";
import { CBEBirrService } from "../../services/cbeBirr.service";
import { AwashService } from "../../services/awash.service";
import { CBEVerificationService } from "../../services/cbe.service";
import { DashenService } from "../../services/dashn.service";
import { AbyssiniaService } from "../../services/abyssinia.service";
import { MPesaService } from "../../services/mpessa.service";
export class ReceiptService {
  static async verify(bank: string, payload: any) {
    switch (bank) {
      case "telebirr":
        return TelebirrService.verify(payload);

      case "cbebirr":
        return CBEBirrService.verify(payload);

      case "awash":
        return AwashService.verify(payload);
      case "cbe":
        return CBEVerificationService.verify(payload);
      case "dashen":
        return DashenService.verify(payload);
      case "abyssinia":
        return AbyssiniaService.verify(payload);
      case "mpesa":
        return MPesaService.verify(payload);

      default:
        throw new Error("Unsupported provider");
    }
  }
}
