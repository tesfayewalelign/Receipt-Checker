import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { rateLimitMiddleware } from "../../middlewares/rateLimit";

const router = Router();

// 📄 receipts history
router.get("/receipts", rateLimitMiddleware, DashboardController.getReceipts);

// 🔑 api keys
router.get("/api-keys", rateLimitMiddleware, DashboardController.getApiKeys);

// 📊 summary stats
router.get("/summary", rateLimitMiddleware, DashboardController.getSummary);

export default router;
