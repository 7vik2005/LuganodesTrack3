import {
  BASE_REWARD_FACTOR,
  WEIGHT_DENOMINATOR,
  FLAG_WEIGHTS,
  GWEI_PER_ETH,
} from "../config/constants.js";

/**
 * Compute base_reward per the Altair spec.
 * Formula: effective_balance * BASE_REWARD_FACTOR / isqrt(total_active_balance)
 *
 * @param {number|string} effectiveBalance — in Gwei (e.g. 32000000000 for 32 ETH)
 * @param {number|string} totalActiveBalance — in Gwei
 * @returns {number} base reward in Gwei
 */
export function getBaseReward(effectiveBalance, totalActiveBalance) {
  const eb = BigInt(effectiveBalance);
  const tab = BigInt(totalActiveBalance);

  // Integer square root (isqrt)
  const sqrtTab = sqrt(tab);
  if (sqrtTab === 0n) return 0;

  // base_reward = effective_balance * BASE_REWARD_FACTOR / isqrt(total_active_balance)
  const baseRewardGwei = (eb * BigInt(BASE_REWARD_FACTOR)) / sqrtTab;

  return Number(baseRewardGwei);
}

/**
 * Integer square root using Newton's method.
 */
function sqrt(value) {
  if (value < 0n) throw new Error("Square root of negative number");
  if (value === 0n) return 0n;
  let x = value;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + value / x) / 2n;
  }
  return x;
}

/**
 * Compute the missed reward for a single participation flag.
 * missed_reward = base_reward * flag_weight / WEIGHT_DENOMINATOR
 *
 * @param {number} baseRewardGwei — base reward in Gwei
 * @param {number} weight — flag weight (14 for source/head, 26 for target)
 * @returns {number} missed reward in Gwei
 */
export function computeMissedReward(baseRewardGwei, weight) {
  return (baseRewardGwei * weight) / WEIGHT_DENOMINATOR;
}

/**
 * Calculate all missed rewards for a validator in one epoch.
 *
 * @param {Object} participation — { timelySource, timelyTarget, timelyHead }
 * @param {number|string} effectiveBalance — in Gwei
 * @param {number|string} totalActiveBalance — in Gwei
 * @returns {Object} missed rewards breakdown in ETH
 */
export function calculateValidatorMissedRewards(
  participation,
  effectiveBalance,
  totalActiveBalance
) {
  const baseRewardGwei = getBaseReward(effectiveBalance, totalActiveBalance);

  let missedSourceGwei = 0;
  let missedTargetGwei = 0;
  let missedHeadGwei = 0;

  if (!participation.timelySource) {
    missedSourceGwei = computeMissedReward(baseRewardGwei, FLAG_WEIGHTS.SOURCE);
  }
  if (!participation.timelyTarget) {
    missedTargetGwei = computeMissedReward(baseRewardGwei, FLAG_WEIGHTS.TARGET);
  }
  if (!participation.timelyHead) {
    missedHeadGwei = computeMissedReward(baseRewardGwei, FLAG_WEIGHTS.HEAD);
  }

  const totalMissedGwei = missedSourceGwei + missedTargetGwei + missedHeadGwei;

  return {
    baseRewardGwei,
    baseRewardEth: baseRewardGwei / GWEI_PER_ETH,
    missedSource: missedSourceGwei / GWEI_PER_ETH,
    missedTarget: missedTargetGwei / GWEI_PER_ETH,
    missedHead: missedHeadGwei / GWEI_PER_ETH,
    totalMissed: totalMissedGwei / GWEI_PER_ETH,
  };
}
