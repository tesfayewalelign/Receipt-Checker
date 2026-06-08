import { Router } from "express";
import multer from "multer";
import { AbyssiniaController } from "../controllers/abyssinia.controller";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), AbyssiniaController.verify);

export default router;
