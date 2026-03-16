import { verifyAwash } from "../../../verifiers/awash.verifier";
import { verifyCBE } from "../../../verifiers/cbe.verifier";
import { verifyTelebirr } from "../../../verifiers/telebirr.verifier";
import { verifyDashen } from "../../../verifiers/dashen.verifier";

export const verifyReceiptService = async (
  bank: string,
  fileBuffer: Buffer,
) => {
  switch (bank.toLowerCase()) {
    case "awash":
      return verifyAwash(fileBuffer);

    case "cbe":
      return verifyCBE(fileBuffer);

    case "telebirr":
      return verifyTelebirr(fileBuffer);

    case "dashen":
      return verifyDashen(fileBuffer);

    default:
      throw new Error("Unsupported bank");
  }
};
