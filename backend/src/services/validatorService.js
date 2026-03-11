import { analyzeValidatorAttestations } from "./attestationService.js";
import { logInfo, logError } from "../utils/logger.js";

/**
 * Main orchestrator: compute attestation performance for all validators
 * across the given epoch range using the Beacon RPC attestation rewards endpoint.
 */
export async function computeValidatorPerformance(
  validatorIndices,
  startEpoch,
  endEpoch
) {
  logInfo(`Computing performance for validators [${validatorIndices}] from epoch ${startEpoch} to ${endEpoch}`);

  // Analyze attestations using the Beacon RPC attestation rewards endpoint
  const epochResults = await analyzeValidatorAttestations(validatorIndices, startEpoch, endEpoch);

  // Aggregate per-validator stats from epoch results
  const validatorStats = {};
  const missingEpochs = [];

  for (const v of validatorIndices) {
    validatorStats[v] = {
      index: v,
      effectiveness: 0,
      totalMissedEth: 0,
      missedSource: 0,
      missedTarget: 0,
      missedHead: 0,
      missedAttestations: 0,
      totalAttestations: 0,
      wrongSourceCount: 0,
      wrongTargetCount: 0,
      wrongHeadCount: 0,
      correctCount: 0,
    };
  }

  for (const result of epochResults) {
    const stats = validatorStats[result.validator];
    if (!stats) continue;

    // Track missing epochs
    if (result.classification === "missing_data") {
      if (!missingEpochs.includes(result.epoch)) {
        missingEpochs.push(result.epoch);
      }
      continue;
    }

    // Skip epochs where validator wasn't scheduled
    if (result.classification === "not_scheduled") continue;

    stats.totalAttestations++;

    switch (result.classification) {
      case "correct":
        stats.correctCount++;
        break;
      case "missed_attestation":
        stats.missedAttestations++;
        break;
      case "wrong_head":
        stats.wrongHeadCount++;
        break;
      case "wrong_target":
        stats.wrongTargetCount++;
        break;
      case "wrong_source":
        stats.wrongSourceCount++;
        break;
    }

    // Accumulate missed ETH from per-epoch data
    stats.missedSource += result.missedSourceEth || 0;
    stats.missedTarget += result.missedTargetEth || 0;
    stats.missedHead += result.missedHeadEth || 0;
    stats.totalMissedEth += result.ethMissed || 0;
  }

  // Calculate effectiveness
  for (const v of validatorIndices) {
    const stats = validatorStats[v];
    if (stats.totalAttestations > 0) {
      stats.effectiveness = (stats.correctCount / stats.totalAttestations) * 100;
    }
  }

  // Include all epoch results (both correct and incorrect) — exclude only
  // missing_data which is already surfaced via missingEpochs
  const filteredEpochs = epochResults.filter(
    (r) => r.classification !== "not_scheduled" && r.classification !== "missing_data"
  );

  // Reconciliation data
  const reconciliation = validatorIndices.map((idx) => {
    const stats = validatorStats[idx];
    return {
      validator: idx,
      toolMissedEth: stats.totalMissedEth,
      toolMissedCount: stats.missedAttestations,
      beaconchaMissedCount: null,
      beaconchaMissedEth: null,
      differencePercent: null,
      note: "Using Beacon RPC attestation rewards directly — most accurate source",
    };
  });

  logInfo("Validator performance computation complete");

  return {
    validators: Object.values(validatorStats),
    epochs: filteredEpochs,
    reconciliation,
    missingEpochs,
  };
}
