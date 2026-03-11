/**
 * Chart rendering for the dashboard
 */

class ChartManager {
  constructor() {
    this.chart = null;
  }

  /**
   * Create and render the performance trend chart
   */
  createTrendChart(epochs, validators) {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!epochs || epochs.length === 0 || !validators || validators.length === 0) {
      return;
    }

    // Group epochs by validator
    const validatorEpochs = {};
    validators.forEach((validator) => {
      validatorEpochs[validator] = epochs
        .filter((e) => e.validator === validator)
        .sort((a, b) => a.epoch - b.epoch);
    });

    // Determine aggregation level based on data size
    const firstValidatorData = validatorEpochs[validators[0]] || [];
    const totalPoints = firstValidatorData.length;
    const aggregateSize = totalPoints > 200 ? Math.ceil(totalPoints / 100) : 1;

    // Build datasets
    const datasets = validators.map((validator, index) => {
      const sortedData = validatorEpochs[validator] || [];

      // Aggregate data points if too many
      let chartData;
      let chartLabels;

      if (aggregateSize > 1) {
        chartData = [];
        chartLabels = [];
        for (let i = 0; i < sortedData.length; i += aggregateSize) {
          const chunk = sortedData.slice(i, i + aggregateSize);
          const correctCount = chunk.filter(
            (e) => e.classification === "correct"
          ).length;
          const effectiveness = (correctCount / chunk.length) * 100;
          chartData.push(effectiveness);
          chartLabels.push(chunk[Math.floor(chunk.length / 2)].epoch);
        }
      } else {
        chartData = sortedData.map((e) => {
          return e.classification === "correct" ? 100 : 0;
        });
        chartLabels = sortedData.map((e) => e.epoch);

        // Calculate 7-epoch moving average for smoother chart
        chartData = chartData.map((_, i) => {
          const windowStart = Math.max(0, i - 3);
          const windowEnd = Math.min(chartData.length, i + 4);
          const window = chartData.slice(windowStart, windowEnd);
          return window.reduce((a, b) => a + b, 0) / window.length;
        });
      }

      // Store labels from first validator (for x-axis)
      if (index === 0) {
        this._labels = chartLabels;
      }

      return {
        label: `Validator ${Utils.truncateString(String(validator), 6, 4)}`,
        data: chartData,
        borderColor: CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length],
        backgroundColor: this.hexToRgba(
          CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length],
          0.05
        ),
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: totalPoints > 50 ? 0 : 3,
        pointHoverRadius: 5,
        pointBackgroundColor:
          CONFIG.CHART_COLORS[index % CONFIG.CHART_COLORS.length],
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      };
    });

    const ctx = document.getElementById("performanceChart");
    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: this._labels || [],
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
              color: "#cbd5e1",
              font: { size: 12, weight: "600" },
              padding: 15,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "rgba(30, 41, 59, 0.9)",
            titleColor: "#f1f5f9",
            bodyColor: "#cbd5e1",
            borderColor: "#475569",
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 12, weight: "bold" },
            bodyFont: { size: 11 },
            displayColors: true,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
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
              color: "#94a3b8",
              font: { size: 11 },
              callback: function (value) {
                return value + "%";
              },
            },
            title: {
              display: true,
              text: "Effectiveness (%)",
              color: "#cbd5e1",
              font: { size: 12, weight: "bold" },
            },
          },
          x: {
            grid: {
              color: "rgba(71, 85, 105, 0.2)",
              drawBorder: false,
            },
            ticks: {
              color: "#94a3b8",
              font: { size: 10 },
              maxTicksLimit: 15,
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
              color: "#cbd5e1",
              font: { size: 12, weight: "bold" },
            },
          },
        },
      },
    });
  }

  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  clear() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}

// Create global chart manager instance
const chartManager = new ChartManager();
