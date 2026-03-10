# Ethereum Validator Performance Dashboard - Frontend

A modern, interactive web-based dashboard for monitoring Ethereum validator attestation performance in real-time.

## Features

✨ **Live Validator Monitoring**

- Track performance of 5 Ethereum validators simultaneously
- Real-time data fetched from the Ethereum Beacon API
- Per-validator summary cards with key metrics

📊 **Interactive Visualizations**

- Performance trend chart with 7-epoch moving averages
- Epoch-by-epoch breakdown table with filtering and sorting
- Component-wise missed reward breakdown (Source/Target/Head)

⏰ **Flexible Time Ranges**

- Preset ranges: 7 days, 14 days, 30 days, 90 days
- Custom date range selection up to 3 months back
- Instant data refresh on range change

🔍 **Data Insights**

- Attestation effectiveness percentage
- Total ETH missed by validator
- Missed attestation counts and classifications
- Failure type breakdown (wrong head/target/source, missed entirely)

✅ **Data Reconciliation**

- Cross-validation against beaconcha.in
- Discrepancy alerts for monitoring data accuracy
- Missing epoch indicators

🎨 **Modern UI/UX**

- Dark theme optimized for extended viewing
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Clear error states and loading indicators

## Project Structure

```
frontend/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styling (variables, responsive design)
├── js/
│   ├── config.js          # Configuration & constants
│   ├── api.js             # Backend API client
│   ├── utils.js           # Utility functions
│   ├── renderer.js        # DOM rendering functions
│   ├── chart.js           # Chart.js wrapper
│   └── app.js             # Main application logic
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend server running on `http://localhost:3000`

### Installation

1. **Clone or navigate to the frontend directory:**

```bash
cd ethereum-validator-dashboard/frontend
```

2. **Serve the frontend:**
   You can use any HTTP server. Here are a few options:

**Python 3:**

```bash
python -m http.server 8000
```

**Node.js with http-server:**

```bash
npm install -g http-server
http-server .
```

**Using VS Code Live Server:**

- Install the Live Server extension
- Right-click on `index.html` → "Open with Live Server"

3. **Open your browser:**
   Navigate to `http://localhost:8000` (or your server's port)

## Configuration

Edit `js/config.js` to customize:

```javascript
// API endpoint
CONFIG.API.BASE_URL = "http://localhost:3000/api";

// Validators to track
CONFIG.VALIDATORS = [
  { pubkey: "0x...", name: "Validator 1" },
  // ... more validators
];

// Default time range (in days)
CONFIG.DEFAULT_DAYS = 7;

// Maximum time range
CONFIG.MAX_DAYS = 90;
```

## API Contract

The frontend expects the backend to provide the following endpoint:

### GET `/api/validators/performance`

**Query Parameters:**

- `validators`: Comma-separated list of validator public keys
- `startEpoch`: Start epoch number
- `endEpoch`: End epoch number

**Response Format:**

```json
{
  "validators": [
    {
      "index": "123",
      "effectiveness": 99.5,
      "totalMissedEth": 0.0001234,
      "missedSource": 0.00001,
      "missedTarget": 0.00002,
      "missedHead": 0.00009,
      "missedAttestations": 1,
      "totalAttestations": 225
    }
  ],
  "epochs": [
    {
      "epoch": 180000,
      "validator": "123",
      "source": true,
      "target": true,
      "head": true,
      "classification": "correct",
      "ethMissed": 0
    }
  ],
  "reconciliation": [
    {
      "validator": "123",
      "dashboardValue": 0.0001234,
      "beaconchainValue": 0.000124,
      "discrepancy": 0.48
    }
  ],
  "missingEpochs": []
}
```

## Key Components

### Config (`js/config.js`)

- Global configuration constants
- Validator definitions
- Ethereum network parameters
- Reward weights from Altair spec

### API Client (`js/api.js`)

- Communicates with backend
- Handles timeouts and retries
- Epoch/date conversion utilities
- Request error handling

### Utils (`js/utils.js`)

- Formatting functions (ETH, percentage, dates)
- Data filtering and sorting
- String truncation
- Statistical functions

### Renderer (`js/renderer.js`)

- Creates validator summary cards
- Renders epoch data table
- Displays alerts and errors
- Manages DOM state

### Chart Manager (`js/chart.js`)

- Creates and maintains performance chart
- Calculates moving averages
- Handles color management

### Main App (`js/app.js`)

- Application orchestration
- Event handling
- State management
- Data flow coordination

## Styling System

The CSS uses CSS variables for theming:

```css
/* Colors */
--primary-color: #7c3aed (Purple) --secondary-color: #06b6d4 (Cyan)
  --success-color: #10b981 (Green) --warning-color: #f59e0b (Amber)
  --danger-color: #ef4444 (Red) /* Dark theme backgrounds */
  --background-color: #0f172a --surface-color: #1e293b --surface-alt: #334155
  /* Spacing scale */ --spacing-xs through --spacing-2xl;
```

All styles are organized by component and include responsive breakpoints.

## Data Flow

```
┌─────────────────────┐
│  User Interaction   │
│ (Date Range, etc.)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   App.loadData()    │ Calculate epoch range
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   APIClient Request │ Fetch from backend
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Parse Response     │ Store in currentData
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Renderer.render*    │ Update DOM
│ ChartManager.create │ Update chart
└─────────────────────┘
```

## Performance Considerations

- **Chart Rendering**: Uses Canvas-based Chart.js for efficient rendering
- **Table Rendering**: Only rendered when needed, optimized with pagination
- **API Calls**: Debounced filter/sort to reduce DOM updates
- **Responsive Design**: Uses modern CSS Grid and Flexbox
- **Dark Theme**: Reduces eye strain and power consumption on OLED displays

## Troubleshooting

### "Failed to load validator data"

- Check backend server is running on correct port
- Verify API endpoint in `config.js`
- Check browser console for detailed error messages
- Ensure network connectivity

### Chart not displaying

- Verify Chart.js library is loaded (check Network tab)
- Check console for JavaScript errors
- Ensure epoch data is available from backend

### Slow performance

- Reduce number of validators
- Decrease time range
- Check backend response times
- Monitor network tab for large payloads

### Date inputs not working

- Ensure modern browser (not IE11)
- Check JavaScript is enabled
- Verify date format is YYYY-MM-DD

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Export data to CSV
- [ ] Custom alerts for low effectiveness
- [ ] Historical data comparison
- [ ] Multi-epoch batch operations
- [ ] Validator profiling system
- [ ] WebSocket for real-time updates
- [ ] Advanced analytics and ML insights
- [ ] Mobile app version

## License

This project is part of the Luganodes validator infrastructure initiative.

## Support

For issues or questions:

1. Check the backend logs
2. Review browser console (F12 → Console)
3. Verify network requests (F12 → Network)
4. Check configuration in `config.js`

---

**Built with ❤️ for Luganodes Team**
