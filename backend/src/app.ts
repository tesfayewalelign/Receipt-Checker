import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import verificationRoutes from "./modules/verification/routes/index";
import { errorHandler } from "./middlewares/error.middleware";
import { toNodeHandler } from "better-auth/node";
import publicRoutes from "./modules/verification/routes/public.routes";
import auth from "./lib/auth";

dotenv.config();

const app = express();
app.all("/api/auth/*any", toNodeHandler(auth));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", publicRoutes);
app.use("/api/verification", verificationRoutes);
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Receipt Checker API is running 🚀",
  });
});

export default app;
