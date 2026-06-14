import { Router } from "express";

import { getHistory, getHistoryDetail } from "./history.controller";

const router = Router();

// GET /api/history
router.get("/", getHistory);

// GET /api/history/1
router.get("/:id", getHistoryDetail);

export default router;
