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
    // Allow up to ~90 days of epochs (225 epochs/day * 90 = 20250)
    const MAX_EPOCH_RANGE = 20250;

    if (isNaN(start) || isNaN(end)) {
      return res
        .status(400)
        .json({ error: "startEpoch and endEpoch must be numbers" });
    }

    if (end - start > MAX_EPOCH_RANGE) {
      return res.status(400).json({
        error: `Epoch range too large. Maximum allowed is ${MAX_EPOCH_RANGE} epochs (≈90 days). Got ${end - start}. Use chunked requests for larger ranges.`,
      });
    }

    if (start >= end) {
      return res
        .status(400)
        .json({ error: "startEpoch must be less than endEpoch" });
    }

    const pubkeys = validators
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    if (pubkeys.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid validator pubkeys provided" });
    }

    logInfo(
      `API request: ${pubkeys.length} validators, epochs ${start}-${end} (${end - start} epochs)`,
    );

    // Convert pubkeys to indices
    const { indices: validatorList, pubkeyMap } =
      await getValidatorIndices(pubkeys);

    if (validatorList.length === 0) {
      return res.status(404).json({
        error:
          "Could not resolve any validator indices from the provided pubkeys",
      });
    }

    logInfo(`Resolved indices: [${validatorList.join(", ")}]`);

    const startTime = Date.now();
    const data = await computeValidatorPerformance(validatorList, start, end);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    logInfo(`Performance computation completed in ${elapsed}s`);

    // Add pubkeyMap to response
    res.json({
      ...data,
      pubkeyMap,
      meta: {
        startEpoch: start,
        endEpoch: end,
        validatorCount: validatorList.length,
        computeTimeSeconds: parseFloat(elapsed),
      },
    });
  } catch (error) {
    logError(`Validator performance API failed: ${error.message}`);
    res.status(500).json({
      error: "Failed to compute validator performance",
      detail: error.message,
    });
  }
}
