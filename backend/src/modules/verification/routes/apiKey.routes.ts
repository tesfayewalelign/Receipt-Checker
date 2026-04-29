import { Router } from "express";
import prisma from "../../../config/database";
import { generateApiKey } from "../../../utils/generateApiKey";

const router = Router();

router.post("/generate-key", async (req, res) => {
  const { userId, name } = req.body;

  const key = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      prefix: "rk_live",
      key,
    },
  });

  res.json({
    success: true,
    data: apiKey,
  });
});

export default router;
