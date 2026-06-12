import { Request, Response } from "express";
import {
  createApiKeyService,
  getApiKeysService,
  revokeApiKeyService,
} from "./apiKey.service";

/**
 * CREATE API KEY
 */
export const createApiKey = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const result = await createApiKeyService(userId, name);

    res.json({
      success: true,

      // 🔥 show once secret key
      secret: result.secret,

      // 🔥 safe DB data for UI
      data: result.data,
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating API key" });
  }
};
/**
 * LIST KEYS
 */
export const getApiKeys = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const keys = await getApiKeysService(userId);

    res.json(keys);
  } catch (err) {
    res.status(500).json({ message: "Error fetching keys" });
  }
};

/**
 * REVOKE KEY
 */
export const revokeApiKey = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;

    await revokeApiKeyService(userId, keyId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error revoking key" });
  }
};
