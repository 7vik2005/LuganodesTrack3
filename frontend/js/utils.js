/**
 * Utility functions for the dashboard
 */

class Utils {
  /**
   * Format a number as ETH with proper decimal places
   */
  static formatETH(value, decimals = 4) {
    if (value === null || value === undefined) return "N/A";
    if (typeof value !== "number" || isNaN(value)) return "0.0000";
    return value.toFixed(decimals);
  }

  /**
   * Format a percentage
   */
  static formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined) return "N/A";
    if (typeof value !== "number" || isNaN(value)) return "0.00%";
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Truncate a long string
   */
  static truncateString(str, startChars = 8, endChars = 6) {
    if (!str) return "";
    str = String(str);
    if (str.length <= startChars + endChars + 3) return str;
    return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
  }

  /**
   * Format a date for display
   */
  static formatDate(date) {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Format epoch with date
   */
  static formatEpochDate(epoch) {
    const date = APIClient.epochToDate(epoch);
    return `Epoch ${epoch} (${this.formatDate(date)})`;
  }

  /**
   * Get effectiveness CSS class
   */
  static getEffectivenessClass(effectiveness) {
    if (effectiveness >= 99) return "";
    if (effectiveness >= 95) return "medium";
    return "low";
  }

  /**
   * Get status badge from classification
   */
  static getStatusBadge(classification) {
    const badges = {
      correct: { text: "✓ Correct", class: "correct" },
      missed_attestation: { text: "✗ Missed", class: "missed" },
      wrong_head: { text: "✗ Wrong Head", class: "incorrect" },
      wrong_target: { text: "✗ Wrong Target", class: "incorrect" },
      wrong_source: { text: "✗ Wrong Source", class: "incorrect" },
    };
    return badges[classification] || { text: "? Unknown", class: "incorrect" };
  }

  /**
   * Get flag badge for source/target/head
   */
  static getFlagBadge(flag) {
    return flag
      ? { text: "✓", class: "correct" }
      : { text: "✗", class: "incorrect" };
  }

  /**
   * Group array by a key
   */
  static groupBy(array, key) {
    const keyFunc = typeof key === "function" ? key : (item) => item[key];
    return array.reduce((groups, item) => {
      const groupKey = keyFunc(item);
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  /**
   * Sort array by a key
   */
  static sortBy(array, key, order = "asc") {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filter array by multiple criteria
   */
  static filterBy(array, criteria) {
    return array.filter((item) => {
      return Object.entries(criteria).every(([key, value]) => {
        if (value === null || value === undefined || value === "") return true;
        if (typeof value === "string") {
          return String(item[key]).toLowerCase().includes(value.toLowerCase());
        }
        return item[key] === value;
      });
    });
  }

  /**
   * Debounce function
   */
  static debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Validate epoch range
   */
  static validateEpochRange(startEpoch, endEpoch) {
    const errors = [];

    if (isNaN(startEpoch) || isNaN(endEpoch)) {
      errors.push("Invalid epoch values");
    }

    if (startEpoch >= endEpoch) {
      errors.push("Start epoch must be before end epoch");
    }

    const maxRange = CONFIG.MAX_DAYS * CONFIG.ETHEREUM.EPOCHS_PER_DAY; // ~20,250 for 90 days
    if (endEpoch - startEpoch > maxRange) {
      errors.push(`Date range cannot exceed ${CONFIG.MAX_DAYS} days`);
    }

    const currentEpoch = APIClient.getCurrentEpoch();
    if (endEpoch > currentEpoch + 1) {
      errors.push("End date cannot be in the future");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Simple statistics
   */
  static average(values) {
    if (!values || !values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  static minMax(values) {
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
}
