import { Router } from "express";

import { rateLimitMiddleware } from "../../../middlewares/rateLimit";
import CBEController from "../controllers/cbe.controller";
import { TelebirrController } from "../controllers/telebirr.controller";
import { verifyReceipt } from "../controllers/verify.controller";
import AwashController from "../controllers/awash.controller";
import multer from "multer";
import { apiKeyMiddleware } from "../../api-keys/apiKey.middleware";

const upload = multer();

/**
 * @openapi
 * /receipt/verify:
 *   post:
 *     summary: Verify a bank receipt
 *     description: Supports CBE, Telebirr, Abyssinia receipts
 *     tags:
 *       - Receipt Verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             type: cbe
 *             reference: DDF8VK998G
 *             accountSuffix: "1234"
 *     responses:
 *       200:
 *         description: Receipt verified successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

const router = Router();

router.post(
  "/receipt/verify",
  apiKeyMiddleware,

  verifyReceipt,
);

export default router;
