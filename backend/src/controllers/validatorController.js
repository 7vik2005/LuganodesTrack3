import { computeValidatorPerformance } from "../services/validatorService.js";

export async function getValidatorPerformance(req, res) {
  try {
    const { validators, startEpoch, endEpoch } = req.query;

    const validatorList = validators.split(",");

    const data = await computeValidatorPerformance(
      validatorList,
      Number(startEpoch),
      Number(endEpoch),
    );

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to compute validator performance",
    });
  }
}
