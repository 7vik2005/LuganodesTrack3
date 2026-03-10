# Getting Started - Complete Setup Guide

This guide walks through setting up and running the **complete** Ethereum Validator Performance Dashboard (frontend + backend).

## Quick Start (5 minutes)

### Prerequisites

- Node.js 16+ (includes npm)
- Git
- Terminal/Command Prompt
- Modern web browser

### Setup

**1. Navigate to project directory:**

```bash
cd ethereum-validator-dashboard
```

**2. Install backend dependencies:**

```bash
cd backend
npm install
```

**3. Configure backend (.env file):**
Create `backend/.env`:

```env
BEACON_RPC=https://mainnet-beacon-api.allthatnode.com
BEACONCHA_API=https://beaconcha.in/api/v1
PORT=3000
```

**4. Start backend:**

```bash
npm run dev  # Development with nodemon
# or
npm start    # Production with node
```

Backend will start at: `http://localhost:3000`

**5. In another terminal, install frontend dependencies (optional):**

```bash
cd frontend
npm install  # Only needed for http-server
```

**6. Start frontend:**

```bash
npm run dev
# or manually
python -m http.server 8000
# or
npx http-server . -p 8000
```

Frontend will open at: `http://localhost:8000`

**7. Open Dashboard:**
Open browser to `http://localhost:8000`

✅ **Done!** The dashboard is now running.

## First Run Checklist

After starting both servers:

- [ ] Backend displays "Express app initialized" in logs
- [ ] Frontend loads without errors in browser console
- [ ] Can select date ranges without errors
- [ ] "Refresh Data" button works
- [ ] Validator cards appear with data
- [ ] Chart renders with trends
- [ ] Table shows epoch data
- [ ] Filter and sort work on table

## Complete Directory Structure

```
ethereum-validator-dashboard/
├── backend/
│   ├── .env                    # Configuration (copy from .env.example)
│   ├── .env.example            # Template
│   ├── package.json
│   ├── src/
│   │   ├── app.js              # Express app
│   │   ├── server.js           # Entry point
│   │   ├── api/
│   │   │   └── validatorRoutes.js
│   │   ├── cache/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/           # Business logic
│   │   └── utils/
│   └── tests/
│
└── frontend/
    ├── index.html              # Main page
    ├── package.json
    ├── css/
    │   └── styles.css          # All styling
    ├── js/
    │   ├── config.js           # Configuration
    │   ├── api.js              # API client
    │   ├── utils.js            # Utilities
    │   ├── renderer.js         # DOM rendering
    │   ├── chart.js            # Charts
    │   └── app.js              # Main app logic
    ├── README.md
    ├── API.md
    ├── DEPLOYMENT.md
    ├── FEATURES.md
    └── GETTING_STARTED.md
```

## Backend Setup in Detail

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs:

- **express**: Web framework
- **axios**: HTTP client for Beacon API
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variables
- **nodemon** (dev): Auto-reload on changes
- **jest** (dev): Testing

### 2. Configure Environment

Create `backend/.env`:

```env
# Beacon API - choose one of these options:
# Option 1: Allthatnode (Recommended)
BEACON_RPC=https://mainnet-beacon-api.allthatnode.com

# Option 2: Local Prysm
BEACON_RPC=http://localhost:3500

# Option 3: Local Lighthouse
BEACON_RPC=http://localhost:5052

# Option 4: Teku
BEACON_RPC=http://localhost:5051

# Beaconcha.in API (for reconciliation)
BEACONCHA_API=https://beaconcha.in/api/v1

# Server port
PORT=3000

# Optional: Logging level
LOG_LEVEL=info
```

### 3. Verify Beacon API

Test your Beacon API connection:

```bash
# From backend directory
curl https://mainnet-beacon-api.allthatnode.com/eth/v1/beacon/genesis
```

You should get a response with genesis data.

### 4. Start Backend

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Expected output:

```
Express app initialized
Server is running on port 3000
```

### 5. Test Backend

In another terminal:

```bash
curl 'http://localhost:3000/health'
```

Should return:

```json
{
  "status": "ok",
  "service": "Ethereum Validator Dashboard Backend"
}
```

## Frontend Setup in Detail

### 1. Configure API URL

Edit `frontend/js/config.js`:

```javascript
// Development
CONFIG.API.BASE_URL = "http://localhost:3000/api";

// Production
// CONFIG.API.BASE_URL = 'https://api.yourdomain.com/api';
```

### 2. Install Optional Dependencies (for http-server)

```bash
cd frontend
npm install
```

Or skip and use Python/Node directly.

### 3. Start Frontend

**Option A: npm (if installed)**

```bash
npm run dev
```

**Option B: Python 3 (built-in on most systems)**

```bash
python -m http.server 8000
```

**Option C: npx (no installation)**

```bash
npx http-server . -p 8000
```

**Option D: VS Code (with Live Server extension)**

- Right-click `index.html`
- Select "Open with Live Server"

### 4. Open Dashboard

Navigate to: `http://localhost:8000`

You should see:

- Header with "Validator Dashboard"
- Loading spinner
- Date range controls (once loaded)
- Validator cards with data
- Performance chart
- Epoch table

## Validator Configuration

The dashboard tracks these **5 validators** by default:

```javascript
// frontend/js/config.js - Edit to track different validators
CONFIG.VALIDATORS = [
  {
    pubkey:
      "0x89ca023fc6975d72384afff7bbfbdc9964732a1ea5b47613101ce8ff4e1da142cdb582778ed7592cb05daedf4ba580fa",
    name: "Validator 1",
  },
  // ... 4 more validators
];
```

To monitor different validators, update the `pubkey` values.

## Environment Variables Reference

### Backend (.env)

| Variable        | Default                       | Description         |
| --------------- | ----------------------------- | ------------------- |
| `BEACON_RPC`    | Required                      | Beacon API endpoint |
| `BEACONCHA_API` | `https://beaconcha.in/api/v1` | Reconciliation API  |
| `PORT`          | 3000                          | Server port         |
| `LOG_LEVEL`     | info                          | Logging verbosity   |

### Frontend (js/config.js)

| Variable       | Default                     | Description        |
| -------------- | --------------------------- | ------------------ |
| `API.BASE_URL` | `http://localhost:3000/api` | Backend API URL    |
| `DEFAULT_DAYS` | 7                           | Default time range |
| `MAX_DAYS`     | 90                          | Maximum time range |

## Port Conflicts?

If ports 3000 or 8000 are in use:

**Change backend port:**

```bash
# In backend/.env
PORT=3001
```

**Change frontend port:**

```bash
# Using Python
python -m http.server 8001

# Using http-server
npx http-server . -p 8001
```

Then update frontend API config:

```javascript
CONFIG.API.BASE_URL = "http://localhost:3001/api";
```

## Troubleshooting

### "Backend not responding"

```bash
# Check if port is in use
netstat -tulpn | grep 3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Test Beacon API connection
curl https://mainnet-beacon-api.allthatnode.com/eth/v1/beacon/genesis

# Check .env file exists with BEACON_RPC
ls -la backend/.env
```

### "Cannot load frontend"

```bash
# Check if port 8000 is in use
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Verify files exist
ls frontend/index.html
ls frontend/js/*.js
```

### "CORS error in browser console"

```
Access to XMLHttpRequest blocked by CORS policy
```

Solution:

1. Ensure backend is running
2. Check API URL in `frontend/js/config.js`
3. Verify CORS is enabled in backend:

```javascript
// backend/src/app.js
app.use(cors());
```

### "API returns 404"

```
GET http://localhost:3000/api/validators/performance?... 404
```

Solution:

1. Verify backend route exists
2. Check `backend/src/api/validatorRoutes.js`
3. Verify app.js registers routes

### Slow performance

**Reduce data load:**

```javascript
// frontend/js/config.js
CONFIG.DEFAULT_DAYS = 7; // Reduce from 7 to 3
CONFIG.MAX_DAYS = 30; // Reduce from 90 to 30
```

## Next Steps

### 1. Explore the Dashboard

- Try different date ranges
- Click through validator cards
- Sort/filter the epoch table
- Check the performance chart

### 2. Review Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [API Documentation](frontend/API.md)
- [Feature Overview](frontend/FEATURES.md)

### 3. Customize for Production

- Update validator public keys
- Configure production Beacon API
- Set up SSL certificates
- Deploy to production server

### 4. Add Custom Features

- Export data to CSV
- Custom alerts
- Email notifications
- Additional validators

## Development Workflow

### Making Backend Changes

```bash
# Backend changes auto-reload with nodemon
cd backend
npm run dev

# Edit any file in backend/src/
# Changes auto-reload automatically

# Stop with Ctrl+C
```

### Making Frontend Changes

```bash
# Frontend changes require browser refresh
# No build step needed!

# Edit any file in frontend/
# Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

# CSS changes: Just refresh
# JavaScript changes: Hard refresh may be needed
# HTML changes: Shift+refresh
```

### Testing Changes

**Backend API:**

```bash
curl 'http://localhost:3000/api/validators/performance?validators=0x...&startEpoch=180000&endEpoch=180225'
```

**Frontend:**

- Check browser console (F12)
- Look for any error messages
- Network tab for API response
- Application tab for localStorage

## Production Deployment

### Quick Deployment

**Backend:**

```bash
# Heroku, Railway, or similar
npm run start
```

**Frontend:**

```bash
# Netlify, Vercel, or GitHub Pages
# Just upload frontend/ folder
```

See [DEPLOYMENT.md](frontend/DEPLOYMENT.md) for full guide.

## Learning Resources

### Ethereum Concepts

- [Beacon Chain Explainer](https://ethereum.org/en/upgrades/beacon-chain/)
- [Staking](https://ethereum.org/en/staking/)
- [Altair Specification](https://github.com/ethereum/consensus-specs/blob/dev/specs/altair/beacon-chain.md)

### Technical Stack

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express Tutorial](https://expressjs.com/)
- [Chart.js Docs](https://www.chartjs.org/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### Beacon API

- [Beacon API Spec](https://ethereum.github.io/beacon-APIs/)
- [Beaconcha.in API](https://beaconcha.in/api)

## Getting Help

1. **Check logs:**
   - Backend: Terminal output
   - Frontend: Browser console (F12)

2. **Common issues:**
   - Port conflicts
   - CORS errors
   - API timeouts
   - Date conversion issues

3. **Review documentation:**
   - Each folder has README.md
   - API.md explains data contract
   - FEATURES.md lists all functionality

4. **Debug with tools:**
   - curl for API testing
   - Chrome DevTools for frontend
   - Network tab for requests/responses

---

**You're ready to go! 🚀**

Need help? Check the documentation in each folder or review the code comments.
