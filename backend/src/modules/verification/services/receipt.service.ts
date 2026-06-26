import prisma from "../../../config/database";

type VerifyResult = {
  reference: string | null;
  amount: number | null;
  status: "verified" | "failed";
  provider: string;
  message?: string;
};

/**
 * Main receipt verification service
 */
export async function verifyReceiptService(
  bank: string,
  fileBuffer: Buffer,
): Promise<VerifyResult> {
  try {
    let reference: string | null = null;
    let amount: number | null = null;
    let status: "verified" | "failed" = "failed";

    /**
     * ---------------------------------------------------
     * 1. SIMULATED EXTRACTION (replace with OCR later)
     * ---------------------------------------------------
     * In real system:
     * - Tesseract OCR for images
     * - PDF parser for receipts
     */
    const extractedText = fileBuffer.toString("utf-8");

    // Fake extraction logic (safe fallback)
    const refMatch = extractedText.match(/REF[:\s]*([A-Za-z0-9-]+)/i);
    const amountMatch = extractedText.match(/(\d+(\.\d{1,2})?)/);

    if (refMatch) reference = refMatch[1];
    if (amountMatch) amount = parseFloat(amountMatch[1]);

    /**
     * ---------------------------------------------------
     * 2. BANK LOGIC
     * ---------------------------------------------------
     */
    switch (bank.toLowerCase()) {
      case "cbe":
      case "cbe-birr":
        if (!reference) {
          throw new Error("Reference missing for CBE verification");
        }
        status = "verified";
        break;

      case "telebirr":
      case "dashen":
      case "boa":
      case "awash":
      case "mpesa":
        if (!reference) {
          throw new Error(`Reference not found for ${bank}`);
        }
        status = "verified";
        break;

      default:
        throw new Error("Unsupported bank");
    }

    /**
     * ---------------------------------------------------
     * 3. SAVE TO DATABASE (SAFE INSERT)
     * ---------------------------------------------------
     */
    const receipt = await prisma.receiptLog.create({
      data: {
        userId: "SYSTEM_USER", // replace with auth user later
        reference: reference ?? null,
        amount: amount ?? null,
        status,
        provider: bank,
      },
    });

    return {
      reference,
      amount,
      status,
      provider: bank,
      message: status === "verified" ? "Verification successful" : "Failed",
    };
  } catch (error: any) {
    console.error("Receipt verification error:", error.message);

    return {
      reference: null,
      amount: null,
      status: "failed",
      provider: bank,
      message: error.message || "Verification failed",
    };
  }
}
