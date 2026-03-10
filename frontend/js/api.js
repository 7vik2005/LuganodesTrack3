/**
 * API utility functions for communicating with the backend
 */

class APIClient {
  constructor(baseUrl = CONFIG.API.BASE_URL) {
    this.baseUrl = baseUrl;
    this.timeout = CONFIG.API.TIMEOUT;
  }

  /**
   * Generic fetch wrapper with timeout and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        try {
          const error = JSON.parse(errorData);
          throw new Error(error.error || `HTTP Error: ${response.status}`);
        } catch (e) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout - server took too long to respond");
      }
      throw error;
    }
  }

  /**
   * Fetch validator performance data
   * @param {Array<string>} validators - Array of validator public keys
   * @param {number} startEpoch - Start epoch
   * @param {number} endEpoch - End epoch
   * @returns {Promise<Object>} Performance data
   */
  async getValidatorPerformance(validators, startEpoch, endEpoch) {
    const validatorsParam = validators.join(",");
    const endpoint = `${CONFIG.API.ENDPOINTS.PERFORMANCE}?validators=${validatorsParam}&startEpoch=${startEpoch}&endEpoch=${endEpoch}`;

    return this.request(endpoint);
  }

  /**
   * Calculate the current epoch based on Ethereum's timeline
   * @returns {number} Current epoch
   */
  static getCurrentEpoch() {
    // Ethereum genesis: 2020-12-01 12:00:23 UTC
    const GENESIS_TIME = 1606824023;
    const SECONDS_PER_EPOCH =
      CONFIG.ETHEREUM.SLOTS_PER_EPOCH * CONFIG.ETHEREUM.SLOT_TIME;

    const currentTime = Math.floor(Date.now() / 1000);
    const secondsSinceGenesis = currentTime - GENESIS_TIME;
    const currentEpoch = Math.floor(secondsSinceGenesis / SECONDS_PER_EPOCH);

    return Math.max(0, currentEpoch);
  }

  /**
   * Convert days to epochs
   * @param {number} days - Number of days
   * @returns {number} Number of epochs
   */
  static daysToEpochs(days) {
    return Math.floor(days * CONFIG.ETHEREUM.EPOCHS_PER_DAY);
  }

  /**
   * Convert epoch to date
   * @param {number} epoch - Epoch number
   * @returns {Date} Date object
   */
  static epochToDate(epoch) {
    const GENESIS_TIME = 1606824023;
    const SECONDS_PER_EPOCH =
      CONFIG.ETHEREUM.SLOTS_PER_EPOCH * CONFIG.ETHEREUM.SLOT_TIME;
    const timestamp = GENESIS_TIME + epoch * SECONDS_PER_EPOCH;
    return new Date(timestamp * 1000);
  }

  /**
   * Convert date to epoch
   * @param {Date} date - Date object
   * @returns {number} Epoch number
   */
  static dateToEpoch(date) {
    const GENESIS_TIME = 1606824023;
    const SECONDS_PER_EPOCH =
      CONFIG.ETHEREUM.SLOTS_PER_EPOCH * CONFIG.ETHEREUM.SLOT_TIME;
    const timestamp = Math.floor(date.getTime() / 1000);
    const epoch = Math.floor((timestamp - GENESIS_TIME) / SECONDS_PER_EPOCH);
    return Math.max(0, epoch);
  }
}

// Create global API client instance
const apiClient = new APIClient();
