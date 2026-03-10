import { epochToSlots } from "../utils/epochUtils.js";
import { fetchBlock } from "./beaconService.js";
import { retry } from "../utils/retry.js";

/**
 * Fetch all slot blocks for a given epoch
 */
export async function processEpoch(epoch) {
  const { start, end } = epochToSlots(epoch);

  const slotBlocks = [];
  const missingSlots = [];

  for (let slot = start; slot <= end; slot++) {
    try {
      const block = await retry(() => fetchBlock(slot), 3);

      if (block) {
        slotBlocks.push(block);
      } else {
        missingSlots.push(slot);
      }
    } catch (err) {
      console.error(`Slot fetch failed: ${slot}`);

      missingSlots.push(slot);
    }
  }

  return {
    epoch,
    slotBlocks,
    missingSlots,
  };
}

/**
 * Fetch multiple epochs
 */
export async function processEpochRange(startEpoch, endEpoch) {
  const epochResults = [];
  const missingEpochs = [];

  for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
    try {
      const epochData = await processEpoch(epoch);

      epochResults.push(epochData);
    } catch (error) {
      console.error(`Epoch failed: ${epoch}`);

      missingEpochs.push(epoch);
    }
  }

  return {
    epochResults,
    missingEpochs,
  };
}
