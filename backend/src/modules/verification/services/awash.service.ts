import {
  verifyAwash,
  AwashVerifyResult,
} from "../../../verifiers/awash.verifier";

export interface VerifyPayload {
  reference?: string;
  fileBuffer?: Buffer;
}

export class AwashService {
  static async verify(payload: VerifyPayload): Promise<AwashVerifyResult> {
    return await verifyAwash(payload);
  }
}
