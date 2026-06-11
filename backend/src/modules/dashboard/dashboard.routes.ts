import { Router } from "express";
import { rateLimitMiddleware } from "../../middlewares/rateLimit";
import { getKpis } from "./dashboard.controller";

const router = Router();

router.get("/kpis", getKpis);
router.get("/monthly", getKpis);
router.get("/response-time", getKpis);
router.get("/providers", getKpis);

export default router;
