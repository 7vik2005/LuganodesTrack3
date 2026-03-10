/**
 * Chart rendering for the dashboard
 */

class ChartManager {
  constructor() {
    this.chart = null;
  }

  /**
   * Create and render the performance trend chart
   * @param {Array} epochs - Epoch data
   * @param {Array} validators - Validator indices
   */
  createTrendChart(epochs, validators) {
    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Group epochs by validator
    const validatorEpochs = {};
    validators.forEach((validator) => {
      validatorEpochs[validator] = epochs.filter(
        (e) => e.validator === validator,
      );
    });

    // Calculate effectiveness per epoch for each validator
    const datasets = validators.map((validator, index) => {
      const validatorData = validatorEpochs[validator];
      const sortedData = Utils.sortBy(validatorData, "epoch", "asc");

      // Calculate effectiveness per epoch
      const data = sortedData.map((epoch) => {
        // Determine if attestation was correct
        const isCorrect =
          epoch.classification === "correct" ||
          (epoch.source && epoch.target && epoch.head);
        return isCorrect ? 100 : 0;
      });

      // Calculate moving average (7 epoch window)
      const movingAverageData = data.map((_, i) => {
        const window = data.slice(Math.max(0, i - 3), i + 4);
        return (window.reduce((a, b) => a + b, 0) / window.length) * 100;
      });

      return {
        label: `Validator ${Utils.truncateString(validator, 6, 4)}`,
        data: movingAverageData,
        borderColor: CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length],
        backgroundColor: this.hexToRgba(
          CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length],
          0.05,
        ),
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor:
          CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length],
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      };
    });

    // Get epoch labels
    const allEpochs = epochs.map((e) => e.epoch);
    const firstValidatorEpochs = validatorEpochs[validators[0]];
    const sortedFirstValidator = Utils.sortBy(
      firstValidatorEpochs,
      "epoch",
      "asc",
    );
    const labels = sortedFirstValidator.map((e) => e.epoch);

    const ctx = document.getElementById("performanceChart");
    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "var(--text-primary)",
              font: {
                size: 12,
                weight: "600",
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "rgba(30, 41, 59, 0.9)",
            titleColor: "var(--text-primary)",
            bodyColor: "var(--text-secondary)",
            borderColor: "var(--border-color)",
            borderWidth: 1,
            padding: 12,
            titleFont: {
              size: 12,
              weight: "bold",
            },
            bodyFont: {
              size: 11,
            },
            displayColors: true,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: "rgba(71, 85, 105, 0.2)",
              drawBorder: false,
            },
            ticks: {
              color: "var(--text-muted)",
              font: {
                size: 11,
              },
              callback: function (value) {
                return value + "%";
              },
            },
            title: {
              display: true,
              text: "Effectiveness (%)",
              color: "var(--text-secondary)",
              font: {
                size: 12,
                weight: "bold",
              },
            },
          },
          x: {
            grid: {
              color: "rgba(71, 85, 105, 0.2)",
              drawBorder: false,
            },
            ticks: {
              color: "var(--text-muted)",
              font: {
                size: 10,
              },
              // Show every Nth label to avoid crowding
              callback: function (value, index, ticks) {
                if (ticks.length > 20) {
                  return index % Math.ceil(ticks.length / 10) === 0
                    ? this.getLabelForValue(value)
                    : "";
                }
                return this.getLabelForValue(value);
              },
            },
            title: {
              display: true,
              text: "Epoch",
              color: "var(--text-secondary)",
              font: {
                size: 12,
                weight: "bold",
              },
            },
          },
        },
      },
    });
  }

  /**
   * Convert hex color to rgba
   * @param {string} hex - Hex color code
   * @param {number} alpha - Alpha value (0-1)
   * @returns {string} RGBA color string
   */
  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Clear the chart
   */
  clear() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}

// Create global chart manager instance
const chartManager = new ChartManager();
