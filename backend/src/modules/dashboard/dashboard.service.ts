import prisma from "../../config/database";

export class DashboardService {
  // 📄 Receipt History
  static async getReceipts(userId: string) {
    return await prisma.receiptLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // 🔑 API Keys
  static async getApiKeys(userId: string) {
    return await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // 📊 Summary Stats
  static async getSummary(userId: string) {
    const receipts = await prisma.receiptLog.findMany({
      where: { userId },
    });

    const total = receipts.length;
    const success = receipts.filter((r) => r.status === "verified").length;
    const failed = total - success;

    const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);

    return {
      total,
      success,
      failed,
      totalAmount,
    };
  }
}
