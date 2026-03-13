import { Router } from "express";
import multer from "multer";
import { MPesaController } from "../controllers/mpessa.controller";

const router = Router();
const upload = multer();

router.post("/", upload.single("file"), MPesaController.verify);

export default router;
