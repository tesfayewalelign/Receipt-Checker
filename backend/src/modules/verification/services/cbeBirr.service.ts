import {
  CBEBirrVerifyResult,
  verifyCBEBirr,
} from "../../../verifiers/cbebirr.verifier";

export class CBEBirrService {
  static async verify(input: {
    reference?: string;
    phoneNumber: string;

    fileBuffer?: Buffer;
    fileType?: "pdf" | "image";
  }): Promise<CBEBirrVerifyResult> {
    return await verifyCBEBirr({
      reference: input.reference,
      phoneNumber: input.phoneNumber,
      fileBuffer: input.fileBuffer,
      fileType: input.fileType,
    });
  }
}
