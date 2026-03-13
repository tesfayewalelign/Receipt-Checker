import { Router } from "express";
import multer from "multer";
import { CBEBirrController } from "../controllers/cbeBirr.controller";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), CBEBirrController.verify);

export default router;
