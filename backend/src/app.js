import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import validatorRoutes from "./api/validatorRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/validators", validatorRoutes);

export default app;
