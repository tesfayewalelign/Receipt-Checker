import { Router } from "express";
import cbeRoutes from "./cbe.routes";
import abyssiniaRoutes from "./abyssinia.routes";

const router = Router();

router.use("/cbe", cbeRoutes);
router.use("/abyssinia", abyssiniaRoutes);

export default router;
