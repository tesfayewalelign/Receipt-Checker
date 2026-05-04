import { Router } from "express";
import prisma from "../../../config/database";
import { generateApiKey } from "../../../utils/generateApiKey";
import { apiKeyMiddleware } from "../../../middlewares/apiKey.middleware";
import { Request } from "express";
import { Response } from "express";
const router = Router();

router.post("/generate-key", async (req, res) => {
  console.log("🔥 route hit");

  const { userId, name } = req.body;

  const key = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key,
      prefix: "rk_live",
      userId,
    },
  });

  res.json({
    success: true,
    data: apiKey,
  });
});

router.get("/test", (req: Request, res: Response) => {
  console.log("🔥 ROUTE HIT");
  res.send("OK");
});

export default router;
