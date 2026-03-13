import { Router } from "express";
import multer from "multer";
import { DashenController } from "../controllers/dashn.controller";

const router = Router();
const upload = multer();

router.post("/", upload.single("file"), DashenController.verify);

export default router;
