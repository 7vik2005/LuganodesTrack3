import axios from "axios";
import { logInfo, logError } from "../utils/logger.js";

/**
 * Extract attestations from beacon blocks
 */
export function extractAttestations(slotBlocks) {
  const attestations = [];

  if (!slotBlocks || !Array.isArray(slotBlocks)) {
    return attestations;
  }

  for (const block of slotBlocks) {
    try {
      const blockAttestations = block?.data?.message?.body?.attestations || [];

      for (const attestation of blockAttestations) {
        const attData = attestation.data;

        attestations.push({
          slot: attData.slot,
          beacon_block_root: attData.beacon_block_root || null,
          source_epoch: attData.source?.epoch,
          target_epoch: attData.target?.epoch,
          aggregation_bits: attestation.aggregation_bits || "",
        });
      }
    } catch (error) {
      // Skip malformed blocks
      continue;
    }
  }

  logInfo(`Extracted ${attestations.length} attestations from blocks`);
  return attestations;
}

const BEACONCHA_API = "https://beaconcha.in/api/v1";

/**
 * Fetch validator attestations from beaconcha
 */
export async function fetchValidatorAttestations(index, startEpoch, endEpoch) {
  try {
    const url = `${BEACONCHA_API}/validator/${index}/attestations`;

    const response = await axios.get(url);

    const attestations = response.data?.data || [];

    logInfo(
      `Fetched ${attestations.length} total attestations for validator ${index}`,
    );

    // Filter for requested epoch range
    const filtered = attestations.filter(
      (a) => a.epoch >= startEpoch && a.epoch <= endEpoch,
    );

    logInfo(
      `Filtered to ${filtered.length} attestations in epoch range ${startEpoch}-${endEpoch}`,
    );

    return filtered;
  } catch (error) {
    logError(
      `Failed to fetch attestations for validator ${index}: ${error.message}`,
    );

    return [];
  }
}

/**
 * Analyze validator participation
 */
export async function analyzeAttestations(index, startEpoch, endEpoch) {
  const attestations = await fetchValidatorAttestations(
    index,
    startEpoch,
    endEpoch,
  );

  const results = [];

  for (let epoch = startEpoch; epoch <= endEpoch; epoch++) {
    const att = attestations.find((a) => a.epoch === epoch);

    let source = true;
    let target = true;
    let head = true;
    let classification = "correct";

    if (!att) {
      classification = "missed_attestation";
      source = false;
      target = false;
      head = false;
      logInfo(`Validator ${index} epoch ${epoch}: MISSED (no attestation)`);
    } else {
      source = att.source !== false;
      target = att.target !== false;
      head = att.head !== false;

      if (!source || !target || !head) {
        if (!source) classification = "wrong_source";
        else if (!target) classification = "wrong_target";
        else if (!head) classification = "wrong_head";
      }
    }

    results.push({
      epoch,
      validator: index,
      source,
      target,
      head,
      classification,
    });
  }

  logInfo(`Analyzed attestations for validator ${index}`);

  return results;
}
