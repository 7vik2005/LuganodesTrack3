/**
 * Configuration for the Ethereum Validator Dashboard
 */

const CONFIG = {
  // API Configuration
  API: {
    BASE_URL: "http://localhost:3000/api",
    ENDPOINTS: {
      PERFORMANCE: "/validators/performance",
    },
    TIMEOUT: 3600000, // 1 hour — keep loading until all data is rendered
    CHUNK_SIZE: 20250, // Max epochs per chunk request (fits within backend's 20250 limit, ~90 days)
  },

  // Validators to track (5 required validators)
  VALIDATORS: [
    {
      pubkey:
        "0x89ca023fc6975d72384afff7bbfbdc9964732a1ea5b47613101ce8ff4e1da142cdb582778ed7592cb05daedf4ba580fa",
      name: "Validator 1",
    },
    {
      pubkey:
        "0xaf6609c70683b0e98a784fd5a25414f9db991e7faea7cffc71a50d4be5f1be6ade20cd22cf06f26c8d7359d127d7bfdb",
      name: "Validator 2",
    },
    {
      pubkey:
        "0x8d357d1573fedd1ebb4ab2446197c3230778a42590cbf9a57ffb6404c8014a9f9ad03cff5ff62008979ca74c142aee76",
      name: "Validator 3",
    },
    {
      pubkey:
        "0xb936fc731b42c6ff9b4247baa829a7f4bc62ec8d3f02c2702a8a6e12f5caba9a5538d2061e1ba1584f418b86e1d41891",
      name: "Validator 4",
    },
    {
      pubkey:
        "0xa72e6d79ba3ec8b808384c56bdef7ae6af3c2033e09daba28b793ea404df8d025668101416da1de3eae01b8f50ce74db",
      name: "Validator 5",
    },
  ],

  // Time range presets (in days)
  TIME_RANGES: {
    1: "1 Day",
    3: "3 Days",
    7: "7 Days",
    14: "14 Days",
    30: "30 Days",
  },

  MAX_DAYS: 90,
  DEFAULT_DAYS: 7, // 7-day default per spec

  // Ethereum constants
  ETHEREUM: {
    EPOCHS_PER_DAY: 225,
    SLOT_TIME: 12,
    SLOTS_PER_EPOCH: 32,
  },

  // Colors for chart
  CHART_COLORS: [
    "#7c3aed", // Purple
    "#06b6d4", // Cyan
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
  ],

  // Reward weights (from Altair spec)
  REWARD_WEIGHTS: {
    SOURCE: 14,
    TARGET: 26,
    HEAD: 14,
  },

  // Participation constants
  PARTICIPATION: {
    SOURCE_DISTANCE: 5,
    TARGET_DISTANCE: 32,
    HEAD_DISTANCE: 1,
  },
};
