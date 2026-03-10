/**
 * Main application logic for the Ethereum Validator Dashboard
 */

class App {
  constructor() {
    this.currentData = null;
    this.currentValidators = CONFIG.VALIDATORS.map((v) => v.pubkey);
    this.currentRange = CONFIG.DEFAULT_DAYS;
    this.isLoading = false;

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.setupEventListeners();
    this.setInitialDates();
    this.loadData();
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Date range selector
    document
      .getElementById("date-range-select")
      .addEventListener("change", (e) => {
        this.handleDateRangeChange(e.target.value);
      });

    // Custom date inputs
    document.getElementById("start-date").addEventListener("change", () => {
      this.handleCustomDateChange();
    });
    document.getElementById("end-date").addEventListener("change", () => {
      this.handleCustomDateChange();
    });

    // Refresh button
    document.getElementById("refresh-btn").addEventListener("click", () => {
      this.loadData();
    });

    // Retry button
    document.getElementById("retry-btn").addEventListener("click", () => {
      this.loadData();
    });

    // Table filter and sort
    document.getElementById("filter-input").addEventListener(
      "input",
      Utils.debounce((e) => this.filterAndSortTable()),
    );

    document.getElementById("sort-select").addEventListener("change", () => {
      this.filterAndSortTable();
    });
  }

  /**
   * Set initial date inputs
   */
  setInitialDates() {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    document.getElementById("end-date").valueAsDate = today;
    document.getElementById("start-date").valueAsDate = sevenDaysAgo;
  }

  /**
   * Handle date range preset selection
   */
  handleDateRangeChange(value) {
    const customInputs = document.getElementById("custom-date-inputs");

    if (value === "custom") {
      customInputs.style.display = "flex";
      this.currentRange = null;
    } else {
      customInputs.style.display = "none";
      this.currentRange = parseInt(value);

      // Update date inputs
      const today = new Date();
      const startDate = new Date(
        today.getTime() - this.currentRange * 24 * 60 * 60 * 1000,
      );

      document.getElementById("end-date").valueAsDate = today;
      document.getElementById("start-date").valueAsDate = startDate;

      this.loadData();
    }
  }

  /**
   * Handle custom date range change
   */
  handleCustomDateChange() {
    const startDate = document.getElementById("start-date").valueAsDate;
    const endDate = document.getElementById("end-date").valueAsDate;

    if (startDate && endDate) {
      this.loadData();
    }
  }

  /**
   * Get current epoch range
   */
  getEpochRange() {
    const startDate = new Date(
      document.getElementById("start-date").valueAsDate,
    );
    const endDate = new Date(document.getElementById("end-date").valueAsDate);

    const startEpoch = APIClient.dateToEpoch(startDate);
    const endEpoch = APIClient.dateToEpoch(endDate);

    return { startEpoch, endEpoch };
  }

  /**
   * Load validator performance data
   */
  async loadData() {
    if (this.isLoading) return;

    this.isLoading = true;
    Renderer.showLoading();

    try {
      const { startEpoch, endEpoch } = this.getEpochRange();

      // Validate epoch range
      const validation = Utils.validateEpochRange(startEpoch, endEpoch);
      if (!validation.valid) {
        throw new Error(validation.errors[0]);
      }

      // Fetch data from backend
      const data = await apiClient.getValidatorPerformance(
        this.currentValidators,
        startEpoch,
        endEpoch,
      );

      this.currentData = data;
      this.renderDashboard();
      Renderer.showContent();
    } catch (error) {
      console.error("Error loading data:", error);
      Renderer.showError(`Failed to load validator data: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render the complete dashboard
   */
  renderDashboard() {
    if (!this.currentData) return;

    const { validators, epochs, reconciliation, missingEpochs } =
      this.currentData;

    // Enrich validators with public keys for display
    const enrichedValidators = validators.map((v) => ({
      ...v,
      publicKey: this.getValidatorPublicKey(v.index),
    }));

    // Render all components
    Renderer.renderValidatorCards(enrichedValidators);
    Renderer.renderEpochTable(epochs);
    Renderer.renderMissingEpochsAlert(missingEpochs);
    Renderer.renderReconciliation(reconciliation);

    // Create chart
    const validatorIndices = enrichedValidators.map((v) => v.index);
    chartManager.createTrendChart(epochs, validatorIndices);
  }

  /**
   * Get public key for a validator index
   */
  getValidatorPublicKey(index) {
    // In a real scenario, you might need to fetch this from the backend
    // For now, we use the config validators
    const validator = CONFIG.VALIDATORS.find(
      (v) => v.name === `Validator ${index}`,
    );
    return validator ? validator.pubkey : index;
  }

  /**
   * Filter and sort the epoch table
   */
  filterAndSortTable() {
    if (!this.currentData) return;

    const filterValue = document.getElementById("filter-input").value;
    const sortValue = document.getElementById("sort-select").value;

    let epochs = this.currentData.epochs;

    // Filter by validator index
    if (filterValue) {
      epochs = epochs.filter((e) =>
        String(e.validator).toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    // Sort
    switch (sortValue) {
      case "epoch-asc":
        epochs = Utils.sortBy(epochs, "epoch", "asc");
        break;
      case "epoch-desc":
        epochs = Utils.sortBy(epochs, "epoch", "desc");
        break;
      case "eth-desc":
        epochs = Utils.sortBy(epochs, "ethMissed", "desc");
        break;
      case "validator":
        epochs = Utils.sortBy(epochs, "validator", "asc");
        break;
    }

    Renderer.renderEpochTable(epochs);
  }
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.app = new App();
  });
} else {
  window.app = new App();
}
