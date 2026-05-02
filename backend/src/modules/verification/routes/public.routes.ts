import { Router } from "express";
import { apiKeyMiddleware } from "../../../middlewares/apiKey.middleware";
import { rateLimitMiddleware } from "../../../middlewares/rateLimit";

import CBEController from "../controllers/cbe.controller";
import { TelebirrController } from "../controllers/telebirr.controller";
import { verifyReceipt } from "../controllers/verify.controller";
import multer from "multer";

const upload = multer();

const router = Router();

router.get(
  "/cbe/check",
  apiKeyMiddleware,
  rateLimitMiddleware,
  CBEController.verify,
);

router.get(
  "/telebirr/check",
  apiKeyMiddleware,
  rateLimitMiddleware,
  upload.single("file"),
  TelebirrController.verify,
);
router.post("/verify", apiKeyMiddleware, rateLimitMiddleware, verifyReceipt);

export default router;
