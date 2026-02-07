import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import verificationRoutes from "./modules/verification/verification.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/verification", verificationRoutes);
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Receipt Checker API is running 🚀",
  });
});

export default app;
