import axios from "axios";

import { BEACONCHA_API } from "../config/constants.js";
import { logInfo, logError } from "../utils/logger.js";
export async function fetchBeaconchaValidatorData(validatorIndex) {
  const url = `${BEACONCHA_API}/validator/${validatorIndex}`;

  try {
    const response = await axios.get(url);

    if (!response.data?.data) {
      logError(`No data found for validator ${validatorIndex}`);
      return null;
    }

    const data = response.data.data;

    logInfo(`Fetched Beaconcha data for validator ${validatorIndex}`);

    return {
      index: validatorIndex,

      beaconchaMissedEth: data?.attestations_missed || 0,
    };
  } catch (error) {
    logError(`Beaconcha fetch failed for ${validatorIndex}: ${error.message}`);

    return null;
  }
}

function computeDifferencePercent(toolValue, beaconchaValue) {
  if (beaconchaValue === 0) return 0;

  return (Math.abs(toolValue - beaconchaValue) / beaconchaValue) * 100;
}

export async function reconcileValidators(validatorStats) {
  const reconciliationResults = [];

  logInfo(`Starting reconciliation for ${validatorStats.length} validators`);

  for (const validator of validatorStats) {
    try {
      const beaconchaData = await fetchBeaconchaValidatorData(validator.index);

      if (!beaconchaData) {
        logError(`No Beaconcha data for validator ${validator.index}`);
        continue;
      }

      const differencePercent = computeDifferencePercent(
        validator.totalMissedEth,
        beaconchaData.beaconchaMissedEth,
      );

      reconciliationResults.push({
        validator: validator.index,

        toolMissedEth: validator.totalMissedEth,

        beaconchaMissedEth: beaconchaData.beaconchaMissedEth,

        differencePercent,
      });

      logInfo(
        `Reconciliation for validator ${validator.index}: tool=${validator.totalMissedEth}, beaconcha=${beaconchaData.beaconchaMissedEth}`,
      );
    } catch (error) {
      logError(`Reconciliation error for ${validator.index}: ${error.message}`);
    }
  }

  logInfo(
    `Reconciliation completed for ${reconciliationResults.length} validators`,
  );

  return reconciliationResults;
}
