import { Router } from "express";
import AwashController from "../controllers/awash.controller";
import { upload } from "../../../middlewares/upload.middleware";

const router = Router();

router.post("/", upload.single("file"), AwashController.verify);

export default router;
