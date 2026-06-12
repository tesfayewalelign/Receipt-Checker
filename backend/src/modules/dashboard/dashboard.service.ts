import { prisma } from "../../lib/prisma";

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
export const getKpisService = async () => {
  const total = await prisma.verificationLog.count();

  const fraud = await prisma.verificationLog.count({
    where: { status: "fraud" },
  });

  const avg = await prisma.verificationLog.aggregate({
    _avg: { responseTime: true },
  });

  return {
    totalVerifications: total,
    fraudCount: fraud,
    avgResponseTime: avg._avg.responseTime || 0,
  };
};
export const getProfile = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      image: true,
    },
  });
};
export const updateProfile = async (userId: string, data: any) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: `${data.firstName} ${data.lastName}`,

      companyName: data.companyName,

      image: data.image,
    },
  });
};
