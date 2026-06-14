# Ethereum Validator Performance Dashboard
![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Ethereum](https://img.shields.io/badge/Ethereum-Beacon%20Chain-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)

A full-stack dashboard for monitoring Ethereum validator attestation performance, computing missed rewards using the **Altair consensus specification**, and reconciling results against beaconcha.in.

## Quick Start

### Prerequisites
- Node.js 18+
- An Ethereum Beacon Chain RPC endpoint (e.g., Alchemy, Infura, or Quicknode)

### Setup

```bash
# Clone and install backend
cd backend
npm install

# Configure .env (BEACON_RPC is required)
# Example: BEACON_RPC=https://eth-mainnetbeacon.g.alchemy.com/v2/YOUR_KEY
cp .env.example .env  # Edit with your API key

# Start backend (port 3000)
npm run dev

# In a separate terminal, start frontend (port 8000)
cd frontend
npx http-server . -p 8000 --cors -c-1
```

Open **http://localhost:8000** in your browser.

---

## Architecture

```
├── backend/                  # Express.js REST API
│   ├── src/
│   │   ├── api/              # Route definitions
│   │   ├── controllers/      # Request handling
│   │   ├── services/         # Core business logic
│   │   │   ├── beaconService.js        # Beacon chain RPC client
│   │   │   ├── attestationService.js   # Attestation analysis via beaconcha.in
│   │   │   ├── rewardEngine.js         # Altair reward formula (BigInt)
│   │   │   ├── validatorService.js     # Main orchestrator
│   │   │   ├── reconciliationService.js # Cross-check with beaconcha.in
│   │   │   └── validatorLookupService.js # Pubkey → index resolution
│   │   ├── cache/            # File-based epoch caching
│   │   ├── config/           # Constants (Altair spec values)
│   │   └── utils/            # Logger, retry, epoch math
│   └── package.json
│
└── frontend/                 # Static HTML/CSS/JS dashboard
    ├── index.html
    ├── css/styles.css
    └── js/
        ├── config.js         # Validator pubkeys & app settings
        ├── api.js            # Backend API client with chunking
        ├── app.js            # Main application logic
        ├── renderer.js       # DOM rendering
        ├── chart.js          # Chart.js trend visualization
        └── utils.js          # Formatting, validation, helpers
```

---

## API Contract

### `GET /api/validators/performance`

**Query Parameters:**
| Parameter    | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `validators` | string | Comma-separated validator public keys    |
| `startEpoch` | number | Start epoch (inclusive)                   |
| `endEpoch`   | number | End epoch (inclusive), max range: 3000   |

**Response:**
```json
{
  "validators": [
    {
      "index": 123456,
      "effectiveness": 99.5,
      "totalMissedEth": 0.000012,
      "missedSource": 0.000003,
      "missedTarget": 0.000006,
      "missedHead": 0.000003,
      "missedAttestations": 1,
      "totalAttestations": 225,
      "wrongSourceCount": 0,
      "wrongTargetCount": 0,
      "wrongHeadCount": 1,
      "correctCount": 224
    }
  ],
  "epochs": [...],
  "reconciliation": [...],
  "missingEpochs": [],
  "pubkeyMap": { "123456": "0x89ca..." },
  "meta": { "startEpoch": 100, "endEpoch": 200, "computeTimeSeconds": 12.5 }
}
```

---

## Altair Reward Formula

Implemented directly from the [Altair consensus specification](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/beacon-chain.md):

```
base_reward = effective_balance × BASE_REWARD_FACTOR / isqrt(total_active_balance)
missed_reward = base_reward × flag_weight / WEIGHT_DENOMINATOR
```

| Flag           | Weight | Timeliness Requirement        |
|---------------|--------|-------------------------------|
| TIMELY_SOURCE  | 14     | Included within 5 slots       |
| TIMELY_TARGET  | 26     | Included within 32 slots      |
| TIMELY_HEAD    | 14     | Included in the next slot     |

**Constants:** `BASE_REWARD_FACTOR = 64`, `WEIGHT_DENOMINATOR = 64`

The implementation uses **BigInt** for integer square root (`isqrt`) to match the spec's integer arithmetic.

---

## Participation Flag Strategy

The full beacon state (~hundreds of MB) is impractical to fetch per epoch. Instead, we use **beaconcha.in's attestation API** as a proxy:

- Fetch attestation records per validator from `GET /api/v1/validator/{index}/attestations`
- Derive flags from `inclusionslot - attesterslot` (inclusion delay):
  - **Source**: delay ≤ 5 slots
  - **Target**: delay ≤ 32 slots
  - **Head**: delay = 1 slot
  - **Missed**: no attestation record or `status = 0`

**Accuracy trade-off:** This approach accurately captures missed attestations and late inclusions. However, it cannot detect incorrect source/target/head *votes* — only late or missing ones. In practice, incorrect votes are rare for well-configured validators, so the impact is minimal.

**If beaconcha.in goes down:** The dashboard will show zero attestation data (not cached data). The total active balance is cached for 1 hour from the beacon RPC. A future improvement would cache attestation data locally.

---

## Caching Strategy

- **Total active balance**: In-memory cache, 1-hour TTL. Fetched from beacon RPC `GET /eth/v1/beacon/states/head/validators?status=active_ongoing`.
- **Epoch data**: File-based cache in `backend/cache/`. Each epoch stored as `epoch_{N}.json`. Recent epochs (<1 hour old) are not served from cache to allow finalization.
- **Validator effective balances**: Fetched live per request (small/fast call).
- **Beaconcha.in requests**: Rate-limited to ~10 req/min (free tier).

---

## Tracked Validators

| # | Public Key (truncated) |
|---|------------------------|
| 1 | `0x89ca02...a580fa`    |
| 2 | `0xaf6609...d7bfdb`    |
| 3 | `0x8d357d...2aee76`    |
| 4 | `0xb936fc...d41891`    |
| 5 | `0xa72e6d...ce74db`    |

---

## Development

```bash
# Backend with auto-reload
cd backend && npm run dev

# Frontend with live server
cd frontend && npx http-server . -p 8000 --cors -c-1
```

Backend runs on port **3000**, frontend on port **8000**.
