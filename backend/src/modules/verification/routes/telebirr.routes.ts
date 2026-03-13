import { Router } from "express";
import multer from "multer";
import { TelebirrController } from "../controllers/telebirr.controller";

const router = Router();
const upload = multer();

router.post("/", upload.single("file"), TelebirrController.verify);

export default router;
