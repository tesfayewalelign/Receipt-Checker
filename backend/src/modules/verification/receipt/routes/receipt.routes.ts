// receipt.route.ts

import { Router } from "express";
import { ReceiptController } from "../controllers/receipt.controller";

const router = Router();

router.post("/verify", ReceiptController.verify);

export default router;
