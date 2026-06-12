import { Router } from "express";
import { createApiKey, getApiKeys, revokeApiKey } from "./apiKey.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// all routes protected by login session
router.use(authMiddleware);

router.post("/create", createApiKey);
router.get("/", getApiKeys);
router.delete("/:id", revokeApiKey);

export default router;
