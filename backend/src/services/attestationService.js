import axios from "axios";
import dotenv from "dotenv";
import { retry } from "../utils/retry.js";
import { logInfo, logError } from "../utils/logger.js";
import { GWEI_PER_ETH } from "../config/constants.js";
import { getEpochCache, saveEpochCache } from "../cache/epochCache.js";

dotenv.config();
const BEACON_RPC = process.env.BEACON_RPC;

/**
 * Fetch attestation rewards for specific validators at a given epoch.
 * Uses POST /eth/v1/beacon/rewards/attestations/{epoch}
 * Includes epoch-level caching to avoid redundant API calls.
 */
export async function fetchAttestationRewards(epoch, validatorIndices) {
  // Check cache first
  const cacheKey = `rewards_${epoch}_${validatorIndices.sort().join("_")}`;
  const cached = getEpochCache(epoch);
  if (cached && cached._validators &&
      JSON.stringify(cached._validators.sort()) === JSON.stringify(validatorIndices.map(String).sort())) {
    return {
      idealRewards: cached.idealRewards || [],
      totalRewards: cached.totalRewards || [],
    };
  }

  const url = `${BEACON_RPC}/eth/v1/beacon/rewards/attestations/${epoch}`;
  try {
    const body = validatorIndices.map(String);
    const response = await retry(() =>
      axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
        timeout: 30_000,
      })
    );
    const data = response.data?.data;
    const result = {
      idealRewards: data?.ideal_rewards || [],
      totalRewards: data?.total_rewards || [],
    };

    // Cache the result
    saveEpochCache(epoch, {
      ...result,
      _validators: validatorIndices.map(String),
    });

    return result;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }
    logError(`Attestation rewards fetch failed for epoch ${epoch}: ${error.message}`);
    return null;
  }
}

/**
 * Process a single epoch's attestation rewards into per-validator results.
 */
function processEpochRewards(epoch, rewards, validatorIndices) {
  const results = [];

  if (!rewards) {
    for (const idx of validatorIndices) {
      results.push({
        epoch, validator: idx,
        source: false, target: false, head: false,
        classification: "missing_data",
        ethMissed: 0, headReward: 0, targetReward: 0, sourceReward: 0,
        missedSourceEth: 0, missedTargetEth: 0, missedHeadEth: 0,
      });
    }
    return results;
  }

  const rewardsByValidator = {};
  for (const r of (rewards.totalRewards || [])) {
    rewardsByValidator[r.validator_index] = r;
  }

  // Build ideal reward lookup for estimating missed rewards when value is 0
  const idealByBalance = {};
  for (const r of (rewards.idealRewards || [])) {
    idealByBalance[r.effective_balance] = r;
  }
  const ideal32 = idealByBalance["32000000000"] || Object.values(idealByBalance).pop();

  for (const idx of validatorIndices) {
    const reward = rewardsByValidator[idx];

    if (!reward) {
      results.push({
        epoch, validator: idx,
        source: true, target: true, head: true,
        classification: "not_scheduled",
        ethMissed: 0, headReward: 0, targetReward: 0, sourceReward: 0,
        missedSourceEth: 0, missedTargetEth: 0, missedHeadEth: 0,
      });
      continue;
    }

    const headReward = parseInt(reward.head, 10) || 0;
    const targetReward = parseInt(reward.target, 10) || 0;
    const sourceReward = parseInt(reward.source, 10) || 0;

    // Positive reward = correct, negative = penalty, 0 = missed (no reward earned)
    const headOk = headReward > 0;
    const targetOk = targetReward > 0;
    const sourceOk = sourceReward > 0;

    let missedHeadGwei = headOk ? 0 : Math.abs(headReward);
    let missedTargetGwei = targetOk ? 0 : Math.abs(targetReward);
    let missedSourceGwei = sourceOk ? 0 : Math.abs(sourceReward);

    // Use ideal rewards when actual is 0 (flag missed but no penalty recorded)
    if (ideal32) {
      if (headReward === 0 && !headOk) missedHeadGwei = Math.abs(parseInt(ideal32.head, 10) || 0);
      if (targetReward === 0 && !targetOk) missedTargetGwei = Math.abs(parseInt(ideal32.target, 10) || 0);
      if (sourceReward === 0 && !sourceOk) missedSourceGwei = Math.abs(parseInt(ideal32.source, 10) || 0);
    }

    const totalMissedGwei = missedHeadGwei + missedTargetGwei + missedSourceGwei;

    let classification = "correct";
    if (!sourceOk && !targetOk && !headOk) {
      classification = "missed_attestation";
    } else if (!headOk && sourceOk && targetOk) {
      classification = "wrong_head";
    } else if (!targetOk) {
      classification = "wrong_target";
    } else if (!sourceOk) {
      classification = "wrong_source";
    } else if (!headOk) {
      classification = "wrong_head";
    }

    results.push({
      epoch, validator: idx,
      source: sourceOk, target: targetOk, head: headOk,
      classification,
      ethMissed: totalMissedGwei / GWEI_PER_ETH,
      headReward: headReward / GWEI_PER_ETH,
      targetReward: targetReward / GWEI_PER_ETH,
      sourceReward: sourceReward / GWEI_PER_ETH,
      missedSourceEth: missedSourceGwei / GWEI_PER_ETH,
      missedTargetEth: missedTargetGwei / GWEI_PER_ETH,
      missedHeadEth: missedHeadGwei / GWEI_PER_ETH,
    });
  }

  return results;
}

/**
 * Analyze attestation performance using concurrent batch fetching.
 * Fetches epochs concurrently to reduce total request time.
 */
export async function analyzeValidatorAttestations(validatorIndices, startEpoch, endEpoch) {
  const results = [];
  const totalEpochs = endEpoch - startEpoch + 1;
  const CONCURRENCY = 10;

  logInfo(`Fetching attestation rewards for ${totalEpochs} epochs (concurrency: ${CONCURRENCY})...`);

  // Process epochs in batches of CONCURRENCY
  for (let batchStart = startEpoch; batchStart <= endEpoch; batchStart += CONCURRENCY) {
    const batchEnd = Math.min(batchStart + CONCURRENCY - 1, endEpoch);
    const batchEpochs = [];
    for (let e = batchStart; e <= batchEnd; e++) {
      batchEpochs.push(e);
    }

    // Fetch all epochs in this batch concurrently
    const promises = batchEpochs.map((epoch) =>
      fetchAttestationRewards(epoch, validatorIndices)
        .then((rewards) => ({ epoch, rewards }))
        .catch((err) => {
          logError(`Epoch ${epoch} fetch error: ${err.message}`);
          return { epoch, rewards: null };
        })
    );

    const batchResults = await Promise.all(promises);

    for (const { epoch, rewards } of batchResults) {
      const epochResults = processEpochRewards(epoch, rewards, validatorIndices);
      results.push(...epochResults);
    }

    const processed = batchEnd - startEpoch + 1;
    if (processed % 50 === 0 || batchEnd === endEpoch) {
      logInfo(`Processed ${processed}/${totalEpochs} epochs`);
    }
  }

  logInfo(`Completed: ${results.length} records for ${validatorIndices.length} validators across ${totalEpochs} epochs`);
  return results;
}
