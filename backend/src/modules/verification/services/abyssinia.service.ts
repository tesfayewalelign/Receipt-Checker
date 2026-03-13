import { verifyAbyssinia } from "../../../verifiers/abyssinia.verifier";
export class AbyssiniaService {
  async verify(input: {
    reference?: string;
    accountSuffix?: string;
    fileBuffer?: Buffer;
  }) {
    return await verifyAbyssinia(input);
  }
}

export default new AbyssiniaService();
