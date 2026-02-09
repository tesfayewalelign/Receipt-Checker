import { Router } from "express";
import { VerificationController } from "./verification.controller";

const router = Router();

/**
 * Generic verification endpoint
 * Expects body: { bank: 'CBE' | 'TELEBIRR' | 'DASHEN', reference: string, accountSuffix: string }
 */
router.post("/verify", VerificationController.verify);

export default router;
