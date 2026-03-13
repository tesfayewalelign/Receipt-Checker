import { Router } from "express";
import cbeRoutes from "./cbe.routes";

const router = Router();

router.use("/cbe", cbeRoutes);

export default router;
