import { verifyCBE, VerifyResult } from "../../../verifiers/cbe.verifier";

export interface CBEVerifyPayload {
  fileBuffer?: Buffer;
  reference?: string;
  accountSuffix?: string;
  fileType?: "pdf" | "image";
}

export class CBEVerificationService {
  static async verify(payload: CBEVerifyPayload): Promise<VerifyResult> {
    // accountSuffix is only needed to re-fetch the official PDF from the CBE
    // portal when the user TYPED a reference. An uploaded receipt already
    // contains every field, so don't demand accountSuffix for file uploads —
    // the verifier parses the uploaded PDF directly.
    if (!payload.fileBuffer && !payload.accountSuffix) {
      return { success: false, error: "Account suffix is required" };
    }

    try {
      const result = await verifyCBE(payload);
      return result;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "CBE verification failed",
      };
    }
  }
}
