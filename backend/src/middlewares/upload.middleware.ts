import multer from "multer";
import { Request, Response, NextFunction } from "express";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF or image files are allowed"));
    }

    cb(null, true);
  },
});

// Wraps `upload.single("image")` so that any problem parsing the upload
// (file too large, unsupported type, unexpected/duplicate field, malformed
// multipart body…) is turned into a clean 400 JSON response. Without this the
// raw multer error escapes to the global errorHandler and the client just sees
// an opaque 500, which is why valid PDF/image uploads appeared to "not work".
// The field name MUST stay "image" to match the frontend FormData.
export function uploadReceiptImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  upload.single("image")(req, res, (err: unknown) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Maximum allowed size is 5MB."
          : err.code === "LIMIT_UNEXPECTED_FILE"
            ? 'Unexpected file field. Upload the receipt under the "image" field.'
            : `Upload failed: ${err.message}`;

      return res.status(400).json({ success: false, error: message });
    }

    // fileFilter rejections (non-PDF/image) and any other parse error.
    return res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : "Invalid file upload",
    });
  });
}
