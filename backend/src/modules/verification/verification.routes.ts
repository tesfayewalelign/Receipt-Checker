import { Router } from "express";
import { VerificationController } from "./verification.controller";

const router = Router();

router.post("/verify", VerificationController.verify);

export default router;
