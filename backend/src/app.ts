import express from "express";

import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/**
 * Middlewares
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check route
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Receipt Checker API is running 🚀",
  });
});

export default app;
