/**
 * Main application logic for the Ethereum Validator Dashboard
 */

class App {
  constructor() {
    this.currentData = null;
    this.currentValidators = CONFIG.VALIDATORS.map((v) => v.pubkey);
    this.currentRange = CONFIG.DEFAULT_DAYS;
    this.isLoading = false;
    this.pubkeyMap = {}; // index -> pubkey mapping from backend

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setInitialDates();
    this.loadData();
  }

  setupEventListeners() {
    document
      .getElementById("date-range-select")
      .addEventListener("change", (e) => {
        this.handleDateRangeChange(e.target.value);
      });

    document.getElementById("start-date").addEventListener("change", () => {
      this.handleCustomDateChange();
    });
    document.getElementById("end-date").addEventListener("change", () => {
      this.handleCustomDateChange();
    });

    document.getElementById("refresh-btn").addEventListener("click", () => {
      this.loadData();
    });

    document.getElementById("retry-btn").addEventListener("click", () => {
      this.loadData();
    });

    document.getElementById("filter-input").addEventListener(
      "input",
      Utils.debounce(() => this.filterAndSortTable()),
    );

    document.getElementById("sort-select").addEventListener("change", () => {
      this.filterAndSortTable();
    });
  }

  setInitialDates() {
    const today = new Date();
    const startDate = new Date(
      today.getTime() - CONFIG.DEFAULT_DAYS * 24 * 60 * 60 * 1000,
    );

    document.getElementById("end-date").valueAsDate = today;
    document.getElementById("start-date").valueAsDate = startDate;
  }

  handleDateRangeChange(value) {
    const customInputs = document.getElementById("custom-date-inputs");

    if (value === "custom") {
      customInputs.style.display = "flex";
      this.currentRange = null;
    } else {
      customInputs.style.display = "none";
      this.currentRange = parseInt(value);

      const today = new Date();
      const startDate = new Date(
        today.getTime() - this.currentRange * 24 * 60 * 60 * 1000,
      );

      document.getElementById("end-date").valueAsDate = today;
      document.getElementById("start-date").valueAsDate = startDate;

      this.loadData();
    }
  }

  handleCustomDateChange() {
    const startDate = document.getElementById("start-date").valueAsDate;
    const endDate = document.getElementById("end-date").valueAsDate;

    if (startDate && endDate) {
      this.loadData();
    }
  }

  getEpochRange() {
    const startDate = document.getElementById("start-date").valueAsDate;
    const endDate = document.getElementById("end-date").valueAsDate;

    if (!startDate || !endDate) {
      // Fallback to default range
      const currentEpoch = APIClient.getCurrentEpoch();
      const epochsBack = APIClient.daysToEpochs(CONFIG.DEFAULT_DAYS);
      return {
        startEpoch: currentEpoch - epochsBack,
        endEpoch: currentEpoch,
      };
    }

    return {
      startEpoch: APIClient.dateToEpoch(startDate),
      endEpoch: APIClient.dateToEpoch(endDate),
    };
  }

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

      const totalEpochs = endEpoch - startEpoch;
      const loadStartTime = Date.now();
      Renderer.updateLoadingProgress(
        `Fetching data for ~${totalEpochs} epochs (epochs ${startEpoch} - ${endEpoch})... This may take several minutes.`,
      );

      // Fetch data from backend (with chunking for large ranges)
      const data = await apiClient.getValidatorPerformance(
        this.currentValidators,
        startEpoch,
        endEpoch,
        (done, total) => {
          const elapsed = Math.round((Date.now() - loadStartTime) / 1000);
          const mins = Math.floor(elapsed / 60);
          const secs = elapsed % 60;
          const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
          if (total > 1) {
            Renderer.updateLoadingProgress(
              `Loading chunk ${done}/${total}... (${Math.round((done / total) * 100)}%) — elapsed: ${timeStr}`,
            );
          } else {
            Renderer.updateLoadingProgress(
              `Processing ~${totalEpochs} epochs... elapsed: ${timeStr}`,
            );
          }
        },
      );

      // Store pubkey mapping from backend
      if (data.pubkeyMap) {
        this.pubkeyMap = data.pubkeyMap;
      }

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

  renderDashboard() {
    if (!this.currentData) return;

    const { validators, epochs, reconciliation, missingEpochs } =
      this.currentData;

    // Enrich validators with public keys from backend mapping
    const enrichedValidators = validators.map((v) => ({
      ...v,
      publicKey: this.getValidatorPublicKey(v.index),
    }));

    Renderer.renderValidatorCards(enrichedValidators);
    Renderer.renderEpochTable(epochs);
    Renderer.renderMissingEpochsAlert(missingEpochs);
    Renderer.renderReconciliation(reconciliation);

    // Create chart
    const validatorIndices = enrichedValidators.map((v) => v.index);
    chartManager.createTrendChart(epochs, validatorIndices);
  }

  /**
   * Get public key for a validator index using the backend-provided mapping
   */
  getValidatorPublicKey(index) {
    // First check backend-provided pubkeyMap
    if (this.pubkeyMap && this.pubkeyMap[index]) {
      return this.pubkeyMap[index];
    }
    // Fallback: try to match from config by index position
    for (const v of CONFIG.VALIDATORS) {
      if (v.pubkey && this.pubkeyMap) {
        // Check if this config pubkey maps to this index
        for (const [idx, pk] of Object.entries(this.pubkeyMap)) {
          if (Number(idx) === index) return pk;
        }
      }
    }
    return `Validator ${index}`;
  }

  filterAndSortTable() {
    if (!this.currentData) return;

    const filterValue = document.getElementById("filter-input").value;
    const sortValue = document.getElementById("sort-select").value;

    let epochs = [...this.currentData.epochs];

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
