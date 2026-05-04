import { Router } from "express";
import cbeRoutes from "./cbe.routes";
import abyssiniaRoutes from "./abyssinia.routes";
import awashRoutes from "./awash.routes";
import dashnRoutes from "./dashn.routes";
import MPesaRoutes from "./mpessa.routes";
import teleBirrRoutes from "./telebirr.routes";
import { apiKeyMiddleware } from "../../../middlewares/apiKey.middleware";

import cbeBirrRoutes from "./cbeBirr.routes";
import apiKeyRoutes from "./apiKey.routes";

const router = Router();

router.use("/cbe", cbeRoutes);
router.use("/abyssinia", abyssiniaRoutes);
router.use("/awash", awashRoutes);
router.use("/cbebirr", cbeBirrRoutes);
router.use("/dashn", dashnRoutes);
router.use("/mpessa", MPesaRoutes);
router.use("/telebirr", teleBirrRoutes);
router.use("/test", apiKeyMiddleware, apiKeyRoutes);

export default router;
