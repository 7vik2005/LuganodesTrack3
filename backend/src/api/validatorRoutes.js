import express from "express";

import { getValidatorPerformance } from "../controllers/validatorController.js";

const router = express.Router();

router.get("/performance", getValidatorPerformance);

export default router;
