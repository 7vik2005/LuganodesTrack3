/**
 * Utility functions for the dashboard
 */

class Utils {
  /**
   * Format a number as ETH with proper decimal places
   * @param {number} value - Value in ETH
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted ETH value
   */
  static formatETH(value, decimals = 4) {
    if (!value && value !== 0) return "N/A";
    return value.toFixed(decimals);
  }

  /**
   * Format a percentage
   * @param {number} value - Percentage value (0-100)
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage
   */
  static formatPercentage(value, decimals = 2) {
    if (!value && value !== 0) return "N/A";
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Truncate a long string
   * @param {string} str - String to truncate
   * @param {number} startChars - Number of characters from start
   * @param {number} endChars - Number of characters from end
   * @returns {string} Truncated string
   */
  static truncateString(str, startChars = 8, endChars = 6) {
    if (!str || str.length <= startChars + endChars) return str;
    return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
  }

  /**
   * Format a date for display
   * @param {Date} date - Date object
   * @returns {string} Formatted date
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
   * @param {number} epoch - Epoch number
   * @returns {string} Formatted epoch and date
   */
  static formatEpochDate(epoch) {
    const date = APIClient.epochToDate(epoch);
    return `Epoch ${epoch} (${this.formatDate(date)})`;
  }

  /**
   * Get color based on effectiveness percentage
   * @param {number} effectiveness - Effectiveness percentage (0-100)
   * @returns {string} CSS class name
   */
  static getEffectivenessClass(effectiveness) {
    if (effectiveness >= 99) return "";
    if (effectiveness >= 95) return "medium";
    return "low";
  }

  /**
   * Get status badge data from classification
   * @param {string} classification - Classification string
   * @returns {Object} Badge object with text and class
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
   * Check if a flag was correct
   * @param {boolean} flag - Flag value
   * @returns {Object} Badge object
   */
  static getFlagBadge(flag) {
    return flag
      ? { text: "✓", class: "correct" }
      : { text: "✗", class: "incorrect" };
  }

  /**
   * Group array by a key
   * @param {Array} array - Array to group
   * @param {string|Function} key - Key or function to group by
   * @returns {Object} Grouped object
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
   * @param {Array} array - Array to sort
   * @param {string} key - Key to sort by
   * @param {string} order - 'asc' or 'desc'
   * @returns {Array} Sorted array
   */
  static sortBy(array, key, order = "asc") {
    const sorted = [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  /**
   * Filter array by multiple criteria
   * @param {Array} array - Array to filter
   * @param {Object} criteria - Filter criteria
   * @returns {Array} Filtered array
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
   * Calculate duration between two dates in readable format
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {string} Duration string
   */
  static formatDuration(startDate, endDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.round((endDate - startDate) / msPerDay);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Calculate percentile color for heatmap
   * @param {number} value - Value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {string} Color hex code
   */
  static getPercentileColor(value, min, max) {
    const range = max - min;
    const percentage = (value - min) / range;

    // Green to Red gradient
    const hue = (1 - percentage) * 120; // 120 = green, 0 = red
    return `hsl(${hue}, 100%, 50%)`;
  }

  /**
   * Validate epoch range
   * @param {number} startEpoch - Start epoch
   * @param {number} endEpoch - End epoch
   * @param {number} maxRange - Maximum epoch range
   * @returns {Object} Validation result
   */
  static validateEpochRange(startEpoch, endEpoch, maxRange = 200) {
    const errors = [];

    if (startEpoch >= endEpoch) {
      errors.push("Start epoch must be before end epoch");
    }

    if (endEpoch - startEpoch > maxRange) {
      errors.push(`Epoch range cannot exceed ${maxRange} epochs`);
    }

    const currentEpoch = APIClient.getCurrentEpoch();
    if (endEpoch > currentEpoch) {
      errors.push("End epoch cannot be in the future");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Statistics calculations
   */
  static stats = {
    /**
     * Calculate average
     */
    average: (values) => {
      if (!values.length) return 0;
      return values.reduce((a, b) => a + b, 0) / values.length;
    },

    /**
     * Calculate standard deviation
     */
    stdDev: (values) => {
      const avg = this.stats.average(values);
      const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
      return Math.sqrt(this.stats.average(squareDiffs));
    },

    /**
     * Get min and max
     */
    minMax: (values) => ({
      min: Math.min(...values),
      max: Math.max(...values),
    }),
  };
}
