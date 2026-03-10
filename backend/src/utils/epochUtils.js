import { SLOTS_PER_EPOCH } from "../config/constants.js";
import { logInfo } from "./logger.js";

export function epochToSlots(epoch) {
  const start = epoch * SLOTS_PER_EPOCH;

  const end = start + (SLOTS_PER_EPOCH - 1);

  return {
    start,
    end,
  };
}

export function estimateEpochFromTimestamp(timestamp) {
  const GENESIS_TIME = 1606824023; // Ethereum beacon genesis

  const SLOT_TIME = 12;

  const slot = Math.floor((timestamp - GENESIS_TIME) / SLOT_TIME);

  const epoch = Math.floor(slot / SLOTS_PER_EPOCH);

  logInfo(`Estimated epoch: ${epoch}`);

  return epoch;
}
