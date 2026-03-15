import {
  CBEBirrVerifyResult,
  verifyCBEBirr,
} from "../../../verifiers/cbebirr.verifier";

export class CBEBirrService {
  static async verify(input: {
    receiptNumber?: string;
    phoneNumber: string;
    apiKey: string;
    fileBuffer?: Buffer;
    fileType?: "pdf" | "image";
  }): Promise<CBEBirrVerifyResult> {
    return await verifyCBEBirr({
      receiptNumber: input.receiptNumber,
      phoneNumber: input.phoneNumber,
      apiKey: input.apiKey,
      fileBuffer: input.fileBuffer,
      fileType: input.fileType,
    });
  }
}
