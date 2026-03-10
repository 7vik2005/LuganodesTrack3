import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import validatorRoutes from "./api/validatorRoutes.js";

import { logInfo } from "./utils/logger.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());
app.use("/api/validators", validatorRoutes);
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Ethereum Validator Dashboard Backend",
  });
});
app.get("/", (req, res) => {
  res.json({
    message: "Validator Performance API running",
  });
});

logInfo("Express app initialized");

export default app;
