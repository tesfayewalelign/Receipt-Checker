import { Router } from "express";
import CBEController from "../controllers/cbe.controller";
import { upload } from "../../../middlewares/upload.middleware";

const router = Router();

router.post("/", upload.single("file"), CBEController.verify);

export default router;
