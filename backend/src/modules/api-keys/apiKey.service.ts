import prisma from "../../config/database";
import crypto from "crypto";

/**
 * 🔑 Generate API Key
 */
export function generateApiKey() {
  return "rk_live_" + crypto.randomBytes(32).toString("hex");
}

/**
 * CREATE KEY
 */
export const createApiKeyService = async (userId: string, name?: string) => {
  const rawKey = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name: name || "Default Key",
      prefix: "rk_live",
      key: rawKey,
      status: "active",
    },
  });

  return {
    success: true,

    // 🔥 UI DATA (safe for list view)
    data: {
      id: apiKey.id,
      name: apiKey.name,
      status: apiKey.status,
      createdAt: apiKey.createdAt,
    },

    // 🔥 SECRET KEY (ONLY ONCE → for modal)
    secret: rawKey,
  };
};
/**
 * GET KEYS
 */
export const getApiKeysService = async (userId: string) => {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * REVOKE KEY
 */
export const revokeApiKeyService = async (userId: string, keyId: string) => {
  return prisma.apiKey.updateMany({
    where: {
      id: Number(keyId),
      userId,
    },
    data: {
      status: "revoked",
    },
  });
};

/**
 * VALIDATE KEY (USED IN MIDDLEWARE)
 */
export const validateApiKeyService = async (key: string) => {
  return prisma.apiKey.findUnique({
    where: { key },
    include: { user: true },
  });
};
