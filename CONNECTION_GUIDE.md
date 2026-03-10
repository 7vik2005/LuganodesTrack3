# Frontend-Backend Connection Guide

## ✅ Connection Status: READY

The frontend and backend are now fully configured to communicate.

---

## 🚀 Quick Start (Same Machine)

### Step 1: Start the Backend

```bash
cd backend
npm install  # (only first time)
npm run dev
```

**Expected output:**

```
Express app initialized
Server running on port 3000
```

### Step 2: Start the Frontend (New Terminal)

```bash
cd frontend
npm run dev
# or: python -m http.server 8000
# or: npx http-server . -p 8000
```

**Expected:** Frontend loads at `http://localhost:8000`

### Step 3: Test the Connection

Open browser DevTools (F12) and check the **Network** tab.

1. Go to `http://localhost:8000`
2. The page should load and automatically fetch data
3. You should see a successful API call to:
   ```
   http://localhost:3000/api/validators/performance
   ```

---

## 🔌 Connection Configuration

**Backend:**

- Port: `3000` (set in `backend/.env`)
- CORS: ✅ Enabled (all origins)
- Beacon API: ✅ Configured in `backend/.env`

**Frontend:**

- Base URL: `http://localhost:3000/api`
- Configured in: `frontend/js/config.js`
- Auto-loads on startup ✅

---

## 📊 Testing the Connection

### From Terminal (cURL)

Test if backend is running:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "Ethereum Validator Dashboard Backend"
}
```

Test the API endpoint:

```bash
curl "http://localhost:3000/api/validators/performance?validators=0x89ca023fc6975d72384afff7bbfbdc9964732a1ea5b47613101ce8ff4e1da142cdb582778ed7592cb05daedf4ba580fa&startEpoch=180000&endEpoch=180225"
```

Should return JSON with validator performance data.

### From Browser Console

```javascript
// Check if config is loaded
console.log(CONFIG.API.BASE_URL);
// Should show: http://localhost:3000/api

// Check if API client exists
console.log(apiClient);
// Should show: APIClient instance

// Make a test request
apiClient
  .getValidatorPerformance(
    CONFIG.VALIDATORS.map((v) => v.pubkey),
    180000,
    180005,
  )
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

---

## 🐛 Troubleshooting

### Backend won't start

**Issue:** `Error: listen EADDRINUSE :::3000`

- Port 3000 is already in use

**Solution:**

```bash
# Kill process on port 3000 (Mac/Linux)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or change port in backend/.env
echo "PORT=3001" > backend/.env

# And update frontend config
# Edit frontend/js/config.js:
# CONFIG.API.BASE_URL = 'http://localhost:3001/api'
```

### API returns 404

**Issue:** `GET http://localhost:3000/api/validators/performance 404`

**Solution:**

- Verify backend is running (`npm run dev`)
- Check that `validatorRoutes.js` exists in `backend/src/api/`
- Verify `app.js` has route: `app.use('/api/validators', validatorRoutes)`

### CORS Error

**Issue:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

- Verify backend has `app.use(cors())` in `app.js` ✓
- Restart backend after making changes
- Check browser console for exact error

### No validators showing up

**Issue:** Page loads but no validator cards appear

**Solution:**

1. Check browser DevTools → Console for errors
2. Check Network tab for failed API calls
3. Verify Beacon API is working (check backend logs)
4. Verify validator public keys in `frontend/js/config.js`

### Slow response time

**Issue:** API takes > 10 seconds to respond

**Reason:** Beacon API might be slow

- Try refreshing page
- Check backend logs for errors
- Verify Beacon RPC is accessible: test in new tab
  ```
  https://eth-mainnetbeacon.g.alchemy.com/v2/iPnBync3KXVBqsxL7va3d/eth/v1/beacon/genesis
  ```

---

## 🔄 Data Flow

```
Browser (Frontend)
       │
       │ (HTTP GET)
       ↓
http://localhost:3000/api/validators/performance?validators=...
       ↓
Express Server (Backend)
       │
       │ (Fetch)
       ↓
Beacon API
       │
       │ (Process)
       ↓
Calculate Rewards
       │
       │ (Return JSON)
       ↓
Express Response
       │
       │ (JSON)
       ↓
Browser JavaScript
       │
       │ (Parse & Render)
       ↓
DOM Update
       │
       ↓
User Sees Dashboard
```

---

## 🎯 What Happens on Page Load

1. **Frontend JS loads** (`index.html` → all scripts)
2. **App constructor runs** → `new App()`
3. **Event listeners attached** → buttons, dropdowns ready
4. **Initial dates set** → last 7 days
5. **`loadData()` called** → fetches from backend
6. **Backend receives request** → calculates validator performance
7. **Backend returns JSON** → validator stats, epoch data
8. **Frontend parses data** → stores in `currentData`
9. **Dashboard renders** → cards, chart, table appear

---

## ✨ Features Now Connected

- ✅ Load validator performance data on page load
- ✅ Change date range and re-fetch automatically
- ✅ Filter and sort epoch table
- ✅ View performance trends in chart
- ✅ See reconciliation data
- ✅ Handle errors gracefully

---

## 📝 Current Configuration

**File: `backend/.env`**

```env
PORT=3000
BEACON_RPC=https://eth-mainnetbeacon.g.alchemy.com/v2/iPnBync3KXVBqsxL7va3d
```

**File: `frontend/js/config.js`**

```javascript
CONFIG.API.BASE_URL = "http://localhost:3000/api";
```

---

## 🚀 Next Steps

1. **Start both servers** (see Step 1-2 above)
2. **Open dashboard** at `http://localhost:8000`
3. **Watch Network tab** to see API calls
4. **Check Console** for any errors
5. **See validator cards** load with data

---

## 📞 Support

If you encounter issues:

1. **Check backend logs** - terminal where you ran `npm run dev`
2. **Check browser console** - F12 → Console tab
3. **Check Network tab** - F12 → Network tab
4. **Test API manually** - use curl commands above
5. **Verify your Beacon API** is working

---

**Status: Frontend and Backend Connected ✅**

Everything is ready to go!
