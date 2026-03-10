/**
 * DOM rendering functions for the dashboard
 */

class Renderer {
  /**
   * Render validator summary cards
   * @param {Array} validators - Validator data array
   */
  static renderValidatorCards(validators) {
    const grid = document.getElementById("validators-grid");
    grid.innerHTML = "";

    validators.forEach((validator) => {
      const card = this.createValidatorCard(validator);
      grid.appendChild(card);
    });
  }

  /**
   * Create a single validator card element
   * @param {Object} validator - Validator data
   * @returns {HTMLElement} Card element
   */
  static createValidatorCard(validator) {
    const card = document.createElement("div");
    card.className = "validator-card";

    const effectivenessClass = Utils.getEffectivenessClass(
      validator.effectiveness,
    );
    const pubkeyTruncated = Utils.truncateString(
      validator.publicKey || "",
      8,
      6,
    );

    card.innerHTML = `
            <div class="validator-header">
                <div class="validator-title">
                    <div class="validator-index">Index: ${validator.index}</div>
                    <div class="validator-key">${pubkeyTruncated}</div>
                </div>
                <div class="effectiveness-badge ${effectivenessClass}">
                    ${Utils.formatPercentage(validator.effectiveness)}
                </div>
            </div>

            <div class="validator-stats">
                <div class="stat-item">
                    <div class="stat-label">Total ETH Missed</div>
                    <div class="stat-value eth">${Utils.formatETH(validator.totalMissedEth, 6)} ETH</div>
                </div>

                <div class="stat-item">
                    <div class="stat-label">Missed Attestations</div>
                    <div class="stat-value">${validator.missedAttestations || 0} / ${validator.totalAttestations || 0}</div>
                </div>

                <div class="stat-item">
                    <div class="stat-label">Source Misses</div>
                    <div class="stat-value eth">${Utils.formatETH(validator.missedSource || 0, 6)}</div>
                </div>

                <div class="stat-item">
                    <div class="stat-label">Target Misses</div>
                    <div class="stat-value eth">${Utils.formatETH(validator.missedTarget || 0, 6)}</div>
                </div>

                <div class="stat-item">
                    <div class="stat-label">Head Misses</div>
                    <div class="stat-value eth">${Utils.formatETH(validator.missedHead || 0, 6)}</div>
                </div>
            </div>

            <div class="component-breakdown">
                <div class="component-bar source" title="Source Misses">
                    <div>Source</div>
                    <div>${Utils.formatETH(validator.missedSource || 0, 4)}</div>
                </div>
                <div class="component-bar target" title="Target Misses">
                    <div>Target</div>
                    <div>${Utils.formatETH(validator.missedTarget || 0, 4)}</div>
                </div>
                <div class="component-bar head" title="Head Misses">
                    <div>Head</div>
                    <div>${Utils.formatETH(validator.missedHead || 0, 4)}</div>
                </div>
            </div>
        `;

    return card;
  }

  /**
   * Render the epoch data table
   * @param {Array} epochs - Epoch data array
   * @param {Array} validators - Validator indices for display
   */
  static renderEpochTable(epochs, validators = null) {
    const tbody = document.getElementById("epoch-table-body");
    tbody.innerHTML = "";

    // Filter epochs if validators specified
    let displayEpochs = epochs;
    if (validators && validators.length > 0) {
      displayEpochs = epochs.filter((e) => validators.includes(e.validator));
    }

    // Sort by epoch descending (newest first)
    displayEpochs = Utils.sortBy(displayEpochs, "epoch", "desc");

    displayEpochs.forEach((epochData) => {
      const row = this.createEpochTableRow(epochData);
      tbody.appendChild(row);
    });

    // Show message if no data
    if (displayEpochs.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No epoch data available for selected filters
                    </td>
                </tr>
            `;
    }
  }

  /**
   * Create a table row for epoch data
   * @param {Object} epochData - Epoch data
   * @returns {HTMLElement} Table row element
   */
  static createEpochTableRow(epochData) {
    const row = document.createElement("tr");

    const statusBadge = Utils.getStatusBadge(epochData.classification);
    const sourceBadge = Utils.getFlagBadge(epochData.source);
    const targetBadge = Utils.getFlagBadge(epochData.target);
    const headBadge = Utils.getFlagBadge(epochData.head);

    row.innerHTML = `
            <td>${epochData.epoch}</td>
            <td><code>${Utils.truncateString(epochData.validator, 6, 4)}</code></td>
            <td>
                <span class="status-badge ${statusBadge.class}">
                    ${statusBadge.text}
                </span>
            </td>
            <td>
                <span class="flag-indicator ${sourceBadge.class}" title="Source Correctness">
                    ${sourceBadge.text}
                </span>
            </td>
            <td>
                <span class="flag-indicator ${targetBadge.class}" title="Target Correctness">
                    ${targetBadge.text}
                </span>
            </td>
            <td>
                <span class="flag-indicator ${headBadge.class}" title="Head Correctness">
                    ${headBadge.text}
                </span>
            </td>
            <td class="eth-value">${Utils.formatETH(epochData.ethMissed || 0, 6)}</td>
        `;

    return row;
  }

  /**
   * Render missing epochs alert
   * @param {Array} missingEpochs - Array of missing epoch numbers
   */
  static renderMissingEpochsAlert(missingEpochs) {
    const alert = document.getElementById("missing-epochs-alert");
    const text = document.getElementById("missing-epochs-text");

    if (missingEpochs && missingEpochs.length > 0) {
      const ranges = this.getMissingEpochRanges(missingEpochs);
      text.textContent = `Missing data for epochs: ${ranges.join(", ")}. This data may be available after the network stabilizes.`;
      alert.style.display = "flex";
    } else {
      alert.style.display = "none";
    }
  }

  /**
   * Convert missing epochs array to readable ranges
   * @param {Array} epochs - Array of epoch numbers
   * @returns {Array} Array of range strings
   */
  static getMissingEpochRanges(epochs) {
    if (!epochs || epochs.length === 0) return [];

    const sorted = [...new Set(epochs)].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i <= sorted.length; i++) {
      if (i < sorted.length && sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? String(start) : `${start}-${end}`);
        if (i < sorted.length) {
          start = sorted[i];
          end = sorted[i];
        }
      }
    }

    return ranges;
  }

  /**
   * Render reconciliation information
   * @param {Object} reconciliation - Reconciliation data
   */
  static renderReconciliation(reconciliation) {
    const container = document.getElementById("reconciliation-info");
    container.innerHTML = "";

    if (!reconciliation) {
      container.innerHTML =
        '<p style="color: var(--text-muted);">No reconciliation data available</p>';
      return;
    }

    if (Array.isArray(reconciliation)) {
      reconciliation.forEach((item) => {
        const element = this.createReconciliationItem(item);
        container.appendChild(element);
      });
    } else {
      const element = this.createReconciliationItem(reconciliation);
      container.appendChild(element);
    }
  }

  /**
   * Create a reconciliation item element
   * @param {Object} item - Reconciliation data
   * @returns {HTMLElement} Reconciliation item element
   */
  static createReconciliationItem(item) {
    const div = document.createElement("div");
    div.className = "reconciliation-item";

    const discrepancy = Math.abs(item.discrepancy || 0);
    const statusClass = discrepancy <= 5 ? "success" : "warning";
    const statusText = discrepancy <= 5 ? "✓ Within tolerance" : "⚠ Above 5%";

    div.innerHTML = `
            <h4>Validator ${Utils.truncateString(item.validator, 6, 4)}</h4>
            <p><strong>Dashboard ETH Missed:</strong> ${Utils.formatETH(item.dashboardValue, 6)} ETH</p>
            <p><strong>Beaconcha.in:</strong> ${Utils.formatETH(item.beaconchainValue, 6)} ETH</p>
            <p><strong>Discrepancy:</strong> ${discrepancy.toFixed(2)}%</p>
            <span class="reconciliation-status ${statusClass}">${statusText}</span>
        `;

    return div;
  }

  /**
   * Show loading state
   */
  static showLoading() {
    document.getElementById("loading-state").style.display = "flex";
    document.getElementById("content-container").style.display = "none";
    document.getElementById("error-state").style.display = "none";
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  static showError(message) {
    document.getElementById("error-state").style.display = "flex";
    document.getElementById("content-container").style.display = "none";
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("error-message").textContent = message;
  }

  /**
   * Show content
   */
  static showContent() {
    document.getElementById("content-container").style.display = "flex";
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("error-state").style.display = "none";
  }

  /**
   * Clear all rendered content
   */
  static clearAll() {
    document.getElementById("validators-grid").innerHTML = "";
    document.getElementById("epoch-table-body").innerHTML = "";
  }
}
