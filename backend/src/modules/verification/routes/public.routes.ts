import { Router } from "express";
import { apiKeyMiddleware } from "../../../middlewares/apiKey.middleware";

const router = Router();

router.post("/api/v1/verify/cbe", apiKeyMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Access granted",
    user: req.user,
  });
});

export default router;
