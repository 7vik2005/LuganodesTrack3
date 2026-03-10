import { processEpochRange } from "./epochProcessor.js";
import {
  extractAttestations,
  analyzeAttestations,
} from "./attestationService.js";
import { calculateValidatorMissedRewards } from "./rewardEngine.js";
import { reconcileValidators } from "./reconciliationService.js";
import { logInfo, logError } from "../utils/logger.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const BEACON_RPC = process.env.BEACON_RPC;
const BEACONCHA_API = "https://beaconcha.in/api/v1";

export async function computeValidatorPerformance(
  validatorIndices,
  startEpoch,
  endEpoch,
) {
  logInfo(
    `Computing validator performance from epoch ${startEpoch} to ${endEpoch}`,
  );

  const validatorStats = {};
  const epochResults = [];
  const missingEpochs = [];

  // Initialize stats for all validators
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
    };
  }

  try {
    // Fetch all epoch data to understand the timeframe
    const { epochResults: epochData, missingEpochs: missing } =
      await processEpochRange(startEpoch, endEpoch);
    missingEpochs.push(...missing);

    // Process each validator independently
    for (const validatorIndex of validatorIndices) {
      const stats = validatorStats[validatorIndex];

      logInfo(`Processing validator ${validatorIndex}`);

      // Use analyzeAttestations to get per-epoch participation data
      const epochAnalysis = await analyzeAttestations(
        validatorIndex,
        startEpoch,
        endEpoch,
      );

      if (!epochAnalysis || epochAnalysis.length === 0) {
        logInfo(
          `No attestation data found for validator ${validatorIndex} in epoch range ${startEpoch}-${endEpoch}`,
        );
        continue;
      }

      // Process each epoch from the analysis
      for (const epochData of epochAnalysis) {
        stats.totalAttestations++;

        const sourceCorrect = epochData.source;
        const targetCorrect = epochData.target;
        const headCorrect = epochData.head;
        const participated = epochData.classification !== "missed_attestation";

        if (!participated) {
          stats.missedAttestations++;
        }

        const participation = {
          attested: participated,
          timelySource: sourceCorrect,
          timelyTarget: targetCorrect,
          timelyHead: headCorrect,
        };

        const rewards = calculateValidatorMissedRewards(
          participation,
          32000000000,
          1000000000000000,
        );

        stats.missedSource += rewards.missedSource;
        stats.missedTarget += rewards.missedTarget;
        stats.missedHead += rewards.missedHead;
        stats.totalMissedEth += rewards.totalMissed;

        epochResults.push({
          epoch: epochData.epoch,
          validator: validatorIndex,
          source: sourceCorrect,
          target: targetCorrect,
          head: headCorrect,
          classification: epochData.classification,
          ethMissed: rewards.totalMissed,
        });
      }
    }
  } catch (error) {
    logError(`Validator performance computation failed: ${error.message}`);
  }

  // Calculate effectiveness for each validator
  for (const v of validatorIndices) {
    const stats = validatorStats[v];
    const success = stats.totalAttestations - stats.missedAttestations;
    stats.effectiveness =
      stats.totalAttestations === 0
        ? 0
        : (success / stats.totalAttestations) * 100;
  }

  // Reconcile with Beaconcha
  const reconciliation = await reconcileValidators(
    Object.values(validatorStats),
  );

  logInfo("Validator performance computation complete");

  return {
    validators: Object.values(validatorStats),
    epochs: epochResults,
    reconciliation,
    missingEpochs,
  };
}
