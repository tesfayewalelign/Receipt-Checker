import { Router } from "express";
import { VerificationController } from "./verification.controller";

const router = Router();

router.post("/cbe", VerificationController.verifyCBE);

export default router;
