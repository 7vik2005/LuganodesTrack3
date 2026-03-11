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
          if (e.message.startsWith("HTTP Error") || e.message.includes("Error")) {
            throw e;
          }
          throw new Error(`HTTP Error: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout — the server is still processing. Try a smaller date range.");
      }
      throw error;
    }
  }

  /**
   * Fetch validator performance data.
   * For large epoch ranges, splits into chunks and merges results.
   * Properly aggregates validator stats across all chunks.
   */
  async getValidatorPerformance(validators, startEpoch, endEpoch, onProgress = null) {
    const totalEpochs = endEpoch - startEpoch;
    const chunkSize = CONFIG.API.CHUNK_SIZE;

    // If range fits in one request, do it directly
    if (totalEpochs <= chunkSize) {
      const validatorsParam = validators.join(",");
      const endpoint = `${CONFIG.API.ENDPOINTS.PERFORMANCE}?validators=${encodeURIComponent(validatorsParam)}&startEpoch=${startEpoch}&endEpoch=${endEpoch}`;
      return this.request(endpoint);
    }

    // Chunk large ranges
    const chunks = [];
    for (let s = startEpoch; s < endEpoch; s += chunkSize) {
      const e = Math.min(s + chunkSize, endEpoch);
      chunks.push({ start: s, end: e });
    }

    if (onProgress) onProgress(0, chunks.length);

    const merged = {
      validators: [],
      epochs: [],
      reconciliation: [],
      missingEpochs: [],
      pubkeyMap: {},
    };

    // Use a map to accumulate validator stats across chunks
    const validatorStatsMap = {};

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const validatorsParam = validators.join(",");
      const endpoint = `${CONFIG.API.ENDPOINTS.PERFORMANCE}?validators=${encodeURIComponent(validatorsParam)}&startEpoch=${chunk.start}&endEpoch=${chunk.end}`;

      const data = await this.request(endpoint);

      // Merge epoch-level data
      merged.epochs.push(...(data.epochs || []));
      merged.missingEpochs.push(...(data.missingEpochs || []));

      if (data.pubkeyMap) {
        Object.assign(merged.pubkeyMap, data.pubkeyMap);
      }

      // Accumulate validator stats across chunks
      if (data.validators && Array.isArray(data.validators)) {
        for (const v of data.validators) {
          if (!validatorStatsMap[v.index]) {
            // First time seeing this validator — initialize
            validatorStatsMap[v.index] = { ...v };
          } else {
            // Accumulate stats from subsequent chunks
            const existing = validatorStatsMap[v.index];
            existing.totalMissedEth += v.totalMissedEth || 0;
            existing.missedSource += v.missedSource || 0;
            existing.missedTarget += v.missedTarget || 0;
            existing.missedHead += v.missedHead || 0;
            existing.missedAttestations += v.missedAttestations || 0;
            existing.totalAttestations += v.totalAttestations || 0;
            existing.wrongSourceCount += v.wrongSourceCount || 0;
            existing.wrongTargetCount += v.wrongTargetCount || 0;
            existing.wrongHeadCount += v.wrongHeadCount || 0;
            existing.correctCount += v.correctCount || 0;
          }
        }
      }

      // Use the last chunk's reconciliation (most recent)
      if (i === chunks.length - 1) {
        merged.reconciliation = data.reconciliation || [];
      }

      if (onProgress) onProgress(i + 1, chunks.length);
    }

    // Finalize accumulated validator stats
    const validatorStatsList = Object.values(validatorStatsMap);
    for (const v of validatorStatsList) {
      // Recalculate effectiveness from accumulated counts
      if (v.totalAttestations > 0) {
        v.effectiveness = (v.correctCount / v.totalAttestations) * 100;
      } else {
        v.effectiveness = 0;
      }
    }
    merged.validators = validatorStatsList;

    // Update reconciliation with merged totals
    merged.reconciliation = validatorStatsList.map((v) => ({
      validator: v.index,
      toolMissedEth: v.totalMissedEth,
      toolMissedCount: v.missedAttestations,
      beaconchaMissedCount: null,
      beaconchaMissedEth: null,
      differencePercent: null,
      note: "Using Beacon RPC attestation rewards directly — most accurate source",
    }));

    return merged;
  }

  /**
   * Calculate the current epoch
   */
  static getCurrentEpoch() {
    const GENESIS_TIME = 1606824023;
    const SECONDS_PER_EPOCH = CONFIG.ETHEREUM.SLOTS_PER_EPOCH * CONFIG.ETHEREUM.SLOT_TIME;
    const currentTime = Math.floor(Date.now() / 1000);
    const secondsSinceGenesis = currentTime - GENESIS_TIME;
    return Math.max(0, Math.floor(secondsSinceGenesis / SECONDS_PER_EPOCH));
  }

  /**
   * Convert days to epochs
   */
  static daysToEpochs(days) {
    return Math.floor(days * CONFIG.ETHEREUM.EPOCHS_PER_DAY);
  }

  /**
   * Convert epoch to date
   */
  static epochToDate(epoch) {
    const GENESIS_TIME = 1606824023;
    const SECONDS_PER_EPOCH = CONFIG.ETHEREUM.SLOTS_PER_EPOCH * CONFIG.ETHEREUM.SLOT_TIME;
    const timestamp = GENESIS_TIME + epoch * SECONDS_PER_EPOCH;
    return new Date(timestamp * 1000);
  }

  /**
   * Convert date to epoch
   */
  static dateToEpoch(date) {
    const GENESIS_TIME = 1606824023;
    const SECONDS_PER_EPOCH = CONFIG.ETHEREUM.SLOTS_PER_EPOCH * CONFIG.ETHEREUM.SLOT_TIME;
    const timestamp = Math.floor(date.getTime() / 1000);
    return Math.max(0, Math.floor((timestamp - GENESIS_TIME) / SECONDS_PER_EPOCH));
  }
}

// Create global API client instance
const apiClient = new APIClient();
