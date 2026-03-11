import axios from "axios";
import { BEACONCHA_API } from "../config/constants.js";
import { logInfo, logError } from "../utils/logger.js";

// Rate limiter for beaconcha.in
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100;

async function rateLimitedGet(url) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
  return axios.get(url, { timeout: 30_000 });
}

/**
 * Fetch validator data from beaconcha.in for reconciliation.
 */
export async function fetchBeaconchaValidatorData(validatorIndex) {
  const url = `${BEACONCHA_API}/validator/${validatorIndex}`;
  try {
    const response = await rateLimitedGet(url);
    if (!response.data?.data) {
      return null;
    }
    const data = response.data.data;
    return {
      index: validatorIndex,
      missedAttestations: data?.missingattestations || data?.missed_attestations || 0,
      balance: data?.balance || 0,
      effectiveBalance: data?.effectivebalance || 0,
    };
  } catch (error) {
    logError(`Beaconcha.in fetch failed for ${validatorIndex}: ${error.message}`);
    return null;
  }
}

function computeDifferencePercent(toolValue, beaconchaValue) {
  if (beaconchaValue === 0 && toolValue === 0) return 0;
  if (beaconchaValue === 0) return toolValue > 0 ? 100 : 0;
  return (Math.abs(toolValue - beaconchaValue) / Math.abs(beaconchaValue)) * 100;
}

/**
 * Reconcile computed results against beaconcha.in.
 */
export async function reconcileValidators(validatorStats) {
  const results = [];
  logInfo(`Starting reconciliation for ${validatorStats.length} validators`);

  for (const validator of validatorStats) {
    try {
      const bcData = await fetchBeaconchaValidatorData(validator.index);

      if (!bcData) {
        results.push({
          validator: validator.index,
          toolMissedEth: validator.totalMissedEth,
          toolMissedCount: validator.missedAttestations,
          beaconchaMissedCount: null,
          beaconchaMissedEth: null,
          differencePercent: null,
          note: "beaconcha.in data unavailable",
        });
        continue;
      }

      const diffPct = computeDifferencePercent(
        validator.missedAttestations,
        bcData.missedAttestations
      );

      results.push({
        validator: validator.index,
        toolMissedEth: validator.totalMissedEth,
        toolMissedCount: validator.missedAttestations,
        beaconchaMissedCount: bcData.missedAttestations,
        beaconchaMissedEth: null,
        differencePercent: diffPct,
        note: diffPct <= 5 ? "Within tolerance" : "Divergence — may be due to different time ranges",
      });

      logInfo(`Reconciliation validator ${validator.index}: tool=${validator.missedAttestations}, beaconcha=${bcData.missedAttestations}, diff=${diffPct.toFixed(1)}%`);
    } catch (error) {
      logError(`Reconciliation error for ${validator.index}: ${error.message}`);
      results.push({
        validator: validator.index,
        toolMissedEth: validator.totalMissedEth,
        toolMissedCount: validator.missedAttestations,
        beaconchaMissedCount: null,
        beaconchaMissedEth: null,
        differencePercent: null,
        note: `Error: ${error.message}`,
      });
    }
  }

  logInfo(`Reconciliation completed for ${results.length} validators`);
  return results;
}
