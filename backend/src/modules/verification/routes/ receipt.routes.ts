import express from "express";
import multer from "multer";
import { verifyReceiptController } from "../controllers/receipt.controller";

const router = express.Router();
const upload = multer();

router.post("/receipts/verify", upload.single("file"), verifyReceiptController);

export default router;
