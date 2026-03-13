import {
  DashenVerifyResult,
  verifyDashen,
} from "../../../verifiers/dashen.verifier";

export class DashenService {
  static async verify(input: {
    reference?: string;
    fileBuffer?: Buffer;
    fileType?: "pdf" | "image";
  }): Promise<DashenVerifyResult> {
    return await verifyDashen({
      reference: input.reference,
      fileBuffer: input.fileBuffer,
      fileType: input.fileType,
    });
  }
}
