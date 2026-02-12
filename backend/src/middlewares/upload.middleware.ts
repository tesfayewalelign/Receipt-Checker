import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF or image files are allowed"));
    }

    cb(null, true);
  },
});
