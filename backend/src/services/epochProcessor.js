import { epochToSlots } from "../utils/epochUtils.js";
import { retry } from "../utils/retry.js";
import { logInfo, logError } from "../utils/logger.js";

import { fetchBlock } from "./beaconService.js";
export async function processEpoch(epoch) {
  const { start, end } = epochToSlots(epoch);

  const slotBlocks = [];
  const missingSlots = [];

  logInfo(`Processing epoch ${epoch}`);

  for (let slot = start; slot <= end; slot++) {
    try {
      const block = await retry(() => fetchBlock(slot));

      if (block) {
        slotBlocks.push(block);
      } else {
        missingSlots.push(slot);
      }
    } catch (error) {
      logError(`Slot fetch failed: ${slot}`);

      missingSlots.push(slot);
    }
  }

  return {
    epoch,
    slotBlocks,
    missingSlots,
  };
}
export async function processEpochRange(startEpoch, endEpoch) {
  const epochResults = [];
  const missingEpochs = [];

  logInfo(`Processing epoch range ${startEpoch} → ${endEpoch}`);

  for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
    try {
      const epochData = await processEpoch(epoch);

      epochResults.push(epochData);
    } catch (error) {
      logError(`Epoch processing failed: ${epoch}`);

      missingEpochs.push(epoch);
    }
  }

  return {
    epochResults,
    missingEpochs,
  };
}
