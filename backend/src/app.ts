import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { errorHandler } from "./middlewares/error.middleware";
import verificationRoutes from "./modules/verification/routes/index";
import publicRoutes from "./modules/verification/routes/public.routes";
import apiKeyRoutes from "./modules/verification/routes/apiKeys.routes";
import auth from "./lib/auth";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Receipt Checker API is running 🚀" });
});

app.all("/api/auth/*any", toNodeHandler(auth));
app.use("/api/apikey", apiKeyRoutes);

app.use("/api/public", publicRoutes);
app.use("/api/verification", verificationRoutes);

app.use(errorHandler);

export default app;
