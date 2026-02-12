import { Router } from "express";
import { VerificationController } from "./verification.controller";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post("/verify", upload.single("file"), VerificationController.verify);
export default router;
