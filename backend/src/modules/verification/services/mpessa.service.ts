import { verifyMPesa } from "../../../verifiers/mpesa.verifier";
import { VerifyResult } from "../../../verifiers/cbe.verifier";

export class MPesaService {
  static async verify(input: {
    reference?: string;
    fileBuffer?: Buffer;
    fileType?: "pdf" | "image";
  }): Promise<VerifyResult> {
    return await verifyMPesa({
      reference: input.reference,
      fileBuffer: input.fileBuffer,
      fileType: input.fileType,
      filePath: undefined,
    });
  }
}
