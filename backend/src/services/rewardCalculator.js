const BASE_REWARD_FACTOR = 64;
const BASE_REWARDS_PER_EPOCH = 4;

export function getBaseReward(balance, totalActiveBalance) {
  return (
    (balance * BASE_REWARD_FACTOR) /
    Math.sqrt(totalActiveBalance) /
    BASE_REWARDS_PER_EPOCH
  );
}

export function computeMissedReward(baseReward, weight) {
  return (baseReward * weight) / 64;
}
