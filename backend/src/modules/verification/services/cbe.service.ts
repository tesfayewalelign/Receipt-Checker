import { verifyCBE, VerifyResult } from "../../../verifiers/cbe.verifier";

export interface CBEVerifyPayload {
  fileBuffer?: Buffer;
  reference?: string;
  accountSuffix?: string;
  fileType?: "pdf" | "image";
}

export class CBEVerificationService {
  static async verify(payload: CBEVerifyPayload): Promise<VerifyResult> {
    if (!payload.accountSuffix) {
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
