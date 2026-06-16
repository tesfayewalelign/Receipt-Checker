import { Router } from "express";
import { ReceiptController } from "../controllers/receipt.controller";
import { upload } from "../../../../middlewares/upload.middleware";

const router = Router();

// Accepts BOTH verification methods on the same endpoint:
//   • JSON body (typed transaction details) — parsed by express.json()
//   • multipart/form-data with an "image" file (PDF / photo / screenshot) —
//     parsed by multer. The field name MUST match the frontend, which appends
//     the file as "image" (see frontend/src/services/receipt.service.ts).
router.post("/verify", upload.single("image"), ReceiptController.verify);

export default router;
