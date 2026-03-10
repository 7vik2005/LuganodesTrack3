import {
  BASE_REWARD_FACTOR,
  BASE_REWARDS_PER_EPOCH,
  FLAG_WEIGHTS,
} from "../config/constants.js";

import { logInfo } from "../utils/logger.js";

const GWEI_PER_ETH = 1e9;

export function getBaseReward(effectiveBalance, totalActiveBalance) {
  const baseRewardGwei =
    (effectiveBalance * BASE_REWARD_FACTOR) /
    Math.sqrt(totalActiveBalance) /
    BASE_REWARDS_PER_EPOCH;

  return baseRewardGwei / GWEI_PER_ETH;
}

export function computeMissedReward(baseReward, weight) {
  return (baseReward * weight) / 64;
}

export function calculateValidatorMissedRewards(
  participation,
  effectiveBalance,
  totalActiveBalance,
) {
  const baseReward = getBaseReward(effectiveBalance, totalActiveBalance);

  let missedSource = 0;
  let missedTarget = 0;
  let missedHead = 0;

  if (!participation.timelySource) {
    missedSource = computeMissedReward(baseReward, FLAG_WEIGHTS.SOURCE);
  }

  if (!participation.timelyTarget) {
    missedTarget = computeMissedReward(baseReward, FLAG_WEIGHTS.TARGET);
  }

  if (!participation.timelyHead) {
    missedHead = computeMissedReward(baseReward, FLAG_WEIGHTS.HEAD);
  }

  const totalMissed = missedSource + missedTarget + missedHead;

  logInfo(`Missed rewards calculated: ${totalMissed}`);

  return {
    baseReward,

    missedSource,
    missedTarget,
    missedHead,

    totalMissed,
  };
}
