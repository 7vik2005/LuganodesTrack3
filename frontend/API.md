# API Documentation - Frontend Integration

This document details the API contract between the frontend and backend services.

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://api.yourdomain.com/api`

Configure in `frontend/js/config.js`:

```javascript
CONFIG.API.BASE_URL = "https://api.yourdomain.com/api";
```

## Endpoints

### GET /validators/performance

Fetches performance data for validators over a specified epoch range.

#### Request

**URL Parameters:**

```
GET /api/validators/performance?validators=pubkey1,pubkey2&startEpoch=180000&endEpoch=180225
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `validators` | string | ✓ | Comma-separated public keys of validators |
| `startEpoch` | number | ✓ | Starting epoch (inclusive) |
| `endEpoch` | number | ✓ | Ending epoch (inclusive) |

**Example Request:**

```bash
curl -X GET 'http://localhost:3000/api/validators/performance?validators=0x89ca023fc6975d72384afff7bbfbdc9964732a1ea5b47613101ce8ff4e1da142cdb582778ed7592cb05daedf4ba580fa,0xaf6609c70683b0e98a784fd5a25414f9db991e7faea7cffc71a50d4be5f1be6ade20cd22cf06f26c8d7359d127d7bfdb&startEpoch=180000&endEpoch=180225'
```

#### Response

**Success Response (200 OK):**

```json
{
  "validators": [
    {
      "index": "123456",
      "effectiveness": 99.55,
      "totalMissedEth": 0.00012345,
      "missedSource": 0.00002,
      "missedTarget": 0.00003,
      "missedHead": 0.00007,
      "missedAttestations": 1,
      "totalAttestations": 225
    }
  ],
  "epochs": [
    {
      "epoch": 180000,
      "validator": "123456",
      "source": true,
      "target": true,
      "head": true,
      "classification": "correct",
      "ethMissed": 0
    },
    {
      "epoch": 180001,
      "validator": "123456",
      "source": true,
      "target": false,
      "head": true,
      "classification": "wrong_target",
      "ethMissed": 0.00003
    }
  ],
  "reconciliation": [
    {
      "validator": "123456",
      "dashboardValue": 0.00012345,
      "beaconchainValue": 0.000124,
      "discrepancy": 0.44
    }
  ],
  "missingEpochs": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "validators, startEpoch, and endEpoch are required"
}
```

**Error Response (400 Bad Request - Range Too Large):**

```json
{
  "error": "Epoch range too large. Maximum allowed is 200"
}
```

**Error Response (500 Server Error):**

```json
{
  "error": "Failed to compute validator performance"
}
```

## Response Schema

### Validator Object

```typescript
{
  index: string; // Validator index number as string
  effectiveness: number; // Effectiveness percentage (0-100)
  totalMissedEth: number; // Total ETH missed in the range
  missedSource: number; // ETH missed due to wrong source
  missedTarget: number; // ETH missed due to wrong target
  missedHead: number; // ETH missed due to wrong head
  missedAttestations: number; // Count of missed attestations
  totalAttestations: number; // Total attestations in range
}
```

### Epoch Data Object

```typescript
{
  epoch: number; // Epoch number
  validator: string; // Validator index as string
  source: boolean; // Was source correct?
  target: boolean; // Was target correct?
  head: boolean; // Was head correct?
  classification: string; // Classification: "correct" | "missed_attestation" | "wrong_source" | "wrong_target" | "wrong_head"
  ethMissed: number; // ETH missed in this epoch
}
```

### Reconciliation Object

```typescript
{
  validator: string; // Validator index as string
  dashboardValue: number; // ETH missed (our calculation)
  beaconchainValue: number; // ETH missed (beaconcha.in)
  discrepancy: number; // Percentage discrepancy (0-100)
}
```

## Classification Examples

### Correct Attestation

```json
{
  "epoch": 180000,
  "validator": "123456",
  "source": true,
  "target": true,
  "head": true,
  "classification": "correct",
  "ethMissed": 0
}
```

### Missed Entire Attestation

```json
{
  "epoch": 180001,
  "validator": "123456",
  "source": false,
  "target": false,
  "head": false,
  "classification": "missed_attestation",
  "ethMissed": 0.00054
}
```

### Wrong Head Vote

```json
{
  "epoch": 180002,
  "validator": "123456",
  "source": true,
  "target": true,
  "head": false,
  "classification": "wrong_head",
  "ethMissed": 0.00007
}
```

### Wrong Target Vote

```json
{
  "epoch": 180003,
  "validator": "123456",
  "source": true,
  "target": false,
  "head": false,
  "classification": "wrong_target",
  "ethMissed": 0.0003
}
```

### Wrong Source Vote

```json
{
  "epoch": 180004,
  "validator": "123456",
  "source": false,
  "target": true,
  "head": false,
  "classification": "wrong_source",
  "ethMissed": 0.00022
}
```

## Constants Reference

### Validator Indices

The frontend tracks these 5 validators:

```javascript
{
    pubkey: "0x89ca023fc6975d72384afff7bbfbdc9964732a1ea5b47613101ce8ff4e1da142cdb582778ed7592cb05daedf4ba580fa",
    name: "Validator 1"
},
{
    pubkey: "0xaf6609c70683b0e98a784fd5a25414f9db991e7faea7cffc71a50d4be5f1be6ade20cd22cf06f26c8d7359d127d7bfdb",
    name: "Validator 2"
},
{
    pubkey: "0x8d357d1573fedd1ebb4ab2446197c3230778a42590cbf9a57ffb6404c8014a9f9ad03cff5ff62008979ca74c142aee76",
    name: "Validator 3"
},
{
    pubkey: "0xb936fc731b42c6ff9b4247baa829a7f4bc62ec8d3f02c2702a8a6e12f5caba9a5538d2061e1ba1584f418b86e1d41891",
    name: "Validator 4"
},
{
    pubkey: "0xa72e6d79ba3ec8b808384c56bdef7ae6af3c2033e09daba28b793ea404df8d025668101416da1de3eae01b8f50ce74db",
    name: "Validator 5"
}
```

### Ethereum Parameters

```javascript
EPOCHS_PER_DAY: 225; // 32 slots per epoch, 12 seconds per slot
SLOT_TIME: 12; // seconds
SLOTS_PER_EPOCH: 32;
GENESIS_TIME: 1606824023; // Unix timestamp
```

## Error Handling

The frontend handles the following error scenarios:

### Connection Timeout

**Condition:** No response within 30 seconds
**Frontend Action:** Show "Request timeout - server took too long to respond"

### Invalid Parameters

**Condition:** Missing required query parameters
**Status Code:** 400
**Response:** `{ "error": "validators, startEpoch, and endEpoch are required" }`

### Epoch Range Exceeded

**Condition:** Requested range > 200 epochs
**Status Code:** 400
**Response:** `{ "error": "Epoch range too large. Maximum allowed is 200" }`

### Server Error

**Condition:** Backend processing failed
**Status Code:** 500
**Response:** `{ "error": "Failed to compute validator performance" }`

### Network Error

**Condition:** Network unavailable
**Frontend Action:** Show "Failed to load validator data: [error message]"

## CORS Requirements

The backend must support CORS from the frontend domain:

```javascript
// backend/src/app.js
import cors from "cors";

app.use(
  cors({
    origin: [
      "http://localhost:8000", // Development
      "http://localhost:3000", // Alternative port
      "https://validator.yourdomain.com", // Production
    ],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
```

## Rate Limiting (Recommended)

The frontend makes one request per date range change. Suggested rate limit:

- **Per IP:** 60 requests per minute
- **Per validator:** 100 requests per minute
- **Burst:** Allow 10 concurrent requests

## Caching Strategy

The frontend does NOT cache API responses. Each range change triggers a fresh request.

**Recommended backend caching:**

- Cache individual epoch data: 1 hour
- Cache validator aggregates: 5 minutes
- Cache reconciliation data: 1 hour

## Performance Expectations

| Metric            | Target      | Notes                    |
| ----------------- | ----------- | ------------------------ |
| API Response Time | < 5 seconds | For 225 epochs (7 days)  |
| Data Freshness    | < 1 minute  | From latest beacon block |
| Chart Render      | < 500ms     | With 225 data points     |
| Table Render      | < 200ms     | With 1125 rows           |

## Testing

### Manual API Testing

```bash
# Test with curl
curl -X GET 'http://localhost:3000/api/validators/performance?validators=0x89ca023fc6975d72384afff7bbfbdc9964732a1ea5b47613101ce8ff4e1da142cdb582778ed7592cb05daedf4ba580fa&startEpoch=180000&endEpoch=180225' \
  -H "Content-Type: application/json"

# Pretty print with jq
curl -s 'http://localhost:3000/api/validators/performance?validators=0x89ca023fc6975d72384afff7bbfbdc9964732a1ea5b47613101ce8ff4e1da142cdb582778ed7592cb05daedf4ba580fa&startEpoch=180000&endEpoch=180225' | jq .
```

### Postman Collection

```json
{
  "info": {
    "name": "Validator Dashboard API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Validator Performance",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/validators/performance?validators={{validator_pubkey}}&startEpoch=180000&endEpoch=180225",
          "host": ["{{base_url}}"],
          "path": ["api", "validators", "performance"],
          "query": [
            { "key": "validators", "value": "{{validator_pubkey}}" },
            { "key": "startEpoch", "value": "180000" },
            { "key": "endEpoch", "value": "180225" }
          ]
        }
      }
    }
  ]
}
```

## Integration Checklist

- [ ] Backend implements `/api/validators/performance` endpoint
- [ ] All response fields match schema exactly
- [ ] CORS headers configured correctly
- [ ] Error responses return proper HTTP status codes
- [ ] API responses within performance targets
- [ ] Rate limiting implemented (optional but recommended)
- [ ] Validation data matches beaconcha.in (within 5%)
- [ ] Missing epochs properly handled
- [ ] Tested with Postman or curl
- [ ] Tested with frontend application

## Troubleshooting Integration

### "Failed to load validator data: HTTP Error 500"

- Check backend logs
- Verify epoch range is valid
- Ensure backend Beacon API is configured

### "Failed to load validator data: Request timeout"

- Check backend performance
- Increase timeout in `config.js` if needed
- Verify network connectivity

### No data shown in frontend

- Verify validators exist in Beacon chain
- Check epoch range is within chain history
- Verify backend is returning data

### Discrepancy with beaconcha.in

- Check reward calculation in rewardEngine.js
- Verify base reward formula
- Document approximations in RESEARCH.md

---

**Last Updated:** March 2026
**API Version:** 1.0.0
**Status:** Production Ready
