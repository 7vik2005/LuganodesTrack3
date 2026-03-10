import { epochToSlots } from "../utils/epochUtils.js";
import { fetchBlock } from "./beaconService.js";
import { analyzeAttestations } from "./attestationService.js";
import { getBaseReward, computeMissedReward } from "./rewardCalculator.js";
import { getEpochCache, saveEpochCache } from "../cache/epochCache.js";

const FLAG_WEIGHTS = {
  SOURCE: 14,
  TARGET: 26,
  HEAD: 14,
};

export async function computeValidatorPerformance(
  validatorIndices,
  startEpoch,
  endEpoch,
) {
  const validatorStats = {};
  const epochResults = [];
  const missingEpochs = [];

  // initialize stats for validators
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

  // iterate epochs
  for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
    try {
      let epochData = getEpochCache(epoch);

      if (!epochData) {
        const { start, end } = epochToSlots(epoch);

        const slotData = [];

        for (let slot = start; slot <= end; slot++) {
          try {
            const block = await fetchBlock(slot);

            slotData.push(block);
          } catch (err) {
            console.error(`Slot fetch failed ${slot}`);
          }
        }

        epochData = slotData;

        saveEpochCache(epoch, epochData);
      }

      const attestationResults = analyzeAttestations(
        epoch,
        epochData,
        validatorIndices,
      );

      for (const result of attestationResults) {
        const validator = validatorStats[result.validator];

        validator.totalAttestations++;

        const baseReward = getBaseReward(
          result.balance,
          result.totalActiveBalance,
        );

        let missed = 0;

        if (!result.source) {
          const miss = computeMissedReward(baseReward, FLAG_WEIGHTS.SOURCE);

          validator.missedSource += miss;
          missed += miss;
        }

        if (!result.target) {
          const miss = computeMissedReward(baseReward, FLAG_WEIGHTS.TARGET);

          validator.missedTarget += miss;
          missed += miss;
        }

        if (!result.head) {
          const miss = computeMissedReward(baseReward, FLAG_WEIGHTS.HEAD);

          validator.missedHead += miss;
          missed += miss;
        }

        if (!result.attested) {
          validator.missedAttestations++;
        }

        validator.totalMissedEth += missed;

        epochResults.push({
          epoch,
          validator: result.validator,
          source: result.source,
          target: result.target,
          head: result.head,
          classification: result.classification,
          ethMissed: missed,
        });
      }
    } catch (error) {
      console.error(`Epoch failed ${epoch}`);

      missingEpochs.push(epoch);
    }
  }

  // compute effectiveness

  for (const v of validatorIndices) {
    const stats = validatorStats[v];

    const success = stats.totalAttestations - stats.missedAttestations;

    stats.effectiveness =
      stats.totalAttestations === 0
        ? 0
        : (success / stats.totalAttestations) * 100;
  }

  return {
    validators: Object.values(validatorStats),
    epochs: epochResults,
    missingEpochs,
  };
}
