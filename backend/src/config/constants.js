// Altair consensus spec constants
export const BASE_REWARD_FACTOR = 64;
export const WEIGHT_DENOMINATOR = 64;
export const EFFECTIVE_BALANCE_INCREMENT = 1_000_000_000; // 1 Gwei
export const MAX_EFFECTIVE_BALANCE = 32_000_000_000; // 32 ETH in Gwei

export const FLAG_WEIGHTS = {
  SOURCE: 14,
  TARGET: 26,
  HEAD: 14,
};

export const SLOTS_PER_EPOCH = 32;
export const SECONDS_PER_SLOT = 12;
export const GENESIS_TIME = 1606824023;

// Retry & cache
export const MAX_RETRY = 3;
export const CACHE_FOLDER = "cache";

// External APIs
export const BEACONCHA_API = "https://beaconcha.in/api/v1";

// Gwei/ETH conversion
export const GWEI_PER_ETH = 1_000_000_000;
