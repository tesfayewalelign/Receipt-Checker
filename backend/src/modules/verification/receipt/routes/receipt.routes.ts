import { Router } from "express";
import { ReceiptController } from "../controllers/receipt.controller";
import { uploadReceiptImage } from "../../../../middlewares/upload.middleware";

const router = Router();

// Accepts BOTH verification methods on the same endpoint:
//   • JSON body (typed transaction details) — parsed by express.json()
//   • multipart/form-data with an "image" file (PDF / photo / screenshot) —
//     parsed by multer. The field name MUST match the frontend, which appends
//     the file as "image" (see frontend/src/services/receipt.service.ts).
// uploadReceiptImage wraps multer so upload errors return a clean 400 instead
// of an opaque 500.
router.post("/verify", uploadReceiptImage, ReceiptController.verify);

export default router;
