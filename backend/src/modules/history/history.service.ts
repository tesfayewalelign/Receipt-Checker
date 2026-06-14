import prisma from "../../config/database";

export class HistoryService {
  // Get current user's receipts
  static async getUserHistory(userId: string) {
    return prisma.receiptLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get single receipt detail
  static async getReceiptById(receiptId: number, userId: string) {
    return prisma.receiptLog.findFirst({
      where: {
        id: receiptId,
        userId,
      },
    });
  }
}
