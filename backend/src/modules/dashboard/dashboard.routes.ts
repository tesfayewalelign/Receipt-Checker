import { Router } from "express";
import { rateLimitMiddleware } from "../../middlewares/rateLimit";
import { getKpis } from "./dashboard.controller";
import { handleGetProfile, handleUpdateProfile } from "./dashboard.controller";
import { changePassword } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getOverview } from "./dashboard.controller";

const router = Router();

router.get("/kpis", getKpis);
router.get("/monthly", getKpis);
router.get("/response-time", getKpis);
router.get("/providers", getKpis);
router.get("/profile", handleGetProfile);
router.put("/profile", handleUpdateProfile);
router.put("/change-password", changePassword);
router.get("/overview", authMiddleware, getOverview);

export default router;
