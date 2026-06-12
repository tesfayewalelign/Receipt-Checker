import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { errorHandler } from "./middlewares/error.middleware";
import verificationRoutes from "./modules/verification/routes/index";
import publicRoutes from "./modules/verification/routes/public.routes";
import apiKeyRoutes from "./modules/api-keys/apiKey.routes";
import auth from "./lib/auth";
import router from "./modules/verification/receipt/routes/receipt.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
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
app.use("/api/receipts", router);
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Receipt Checker API is running 🚀" });
});

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/public", publicRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

export default app;
