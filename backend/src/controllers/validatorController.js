import { computeValidatorPerformance } from "../services/validatorService.js";
import { logInfo, logError } from "../utils/logger.js";
import { getValidatorIndices } from "../services/validatorLookupService.js";

export async function getValidatorPerformance(req, res) {
  try {
    const { validators, startEpoch, endEpoch } = req.query;

    if (!validators || !startEpoch || !endEpoch) {
      return res.status(400).json({
        error: "validators, startEpoch, and endEpoch are required",
      });
    }

    const start = Number(startEpoch);
    const end = Number(endEpoch);
    const MAX_EPOCH_RANGE = 200;

    if (end - start > MAX_EPOCH_RANGE) {
      return res.status(400).json({
        error: `Epoch range too large. Maximum allowed is ${MAX_EPOCH_RANGE}`,
      });
    }

    const pubkeys = validators.split(",");

    const validatorList = await getValidatorIndices(pubkeys);

    logInfo(`API request received for validators: ${validatorList.join(",")}`);

    const data = await computeValidatorPerformance(validatorList, start, end);

    res.json(data);
  } catch (error) {
    logError("Validator performance API failed");

    res.status(500).json({
      error: "Failed to compute validator performance",
    });
  }
}
