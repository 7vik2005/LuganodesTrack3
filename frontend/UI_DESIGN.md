# Frontend UI/UX Design Guide

## Dashboard Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ⛓️ Validator Dashboard                                          │
│  Real-time Ethereum Attestation Performance                      │
│  [GRADIENT BACKGROUND - PURPLE TO CYAN]                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     CONTROLS SECTION                             │
│                                                                   │
│  Time Range: [Last 7 Days ▼]                  [🔄 Refresh Data] │
│                                               or                 │
│              [Custom Date Picker]                                │
│              Start: [    ]  End: [    ]                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ VALIDATOR SUMMARY (5 Cards in Responsive Grid)                  │
│                                                                   │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ │  Validator 1     │  │  Validator 2     │  │  Validator 3     │
│ │  Index: 123456   │  │  Index: 234567   │  │  Index: 345678   │
│ │  0x89ca...ba58   │  │  0xaf66...d127   │  │  0x8d35...ae76   │
│ │                  │  │                  │  │                  │
│ │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│ │  │  99.55%    │  │  │  │  98.22%    │  │  │  │  99.11%    │  │
│ │  │(Effectiveness)│ │  │(Effectiveness)│ │  │(Effectiveness)│
│ │  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │
│ │                  │  │                  │  │                  │
│ │ ETH Missed:      │  │ ETH Missed:      │  │ ETH Missed:      │
│ │ 0.000123 ETH     │  │ 0.000234 ETH     │  │ 0.000145 ETH     │
│ │                  │  │                  │  │                  │
│ │ Missed: 1/225    │  │ Missed: 3/225    │  │ Missed: 2/225    │
│ │                  │  │                  │  │                  │
│ │ ┌─────────────┐  │  │ ┌─────────────┐  │  │ ┌─────────────┐  │
│ │ │Source│Target│Head│ │ │Source│Target│Head│ │ │Source│Target│Head│
│ │ │0.00 │ 0.00 │0.00│ │ │0.00 │ 0.00 │0.00│ │ │0.00 │ 0.00 │0.00│
│ │ └─────────────┘  │  │ └─────────────┘  │  │ └─────────────┘  │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘
│
│ ┌──────────────────┐  ┌──────────────────┐
│ │  Validator 4     │  │  Validator 5     │
│ │  Index: 456789   │  │  Index: 567890   │
│ │  0xb936...4189   │  │  0xa72e...74db   │
│ │                  │  │                  │
│ │  ┌────────────┐  │  │  ┌────────────┐  │
│ │  │  97.78%    │  │  │  │  99.33%    │  │
│ │  │(Effectiveness)│ │  │(Effectiveness)│
│ │  └────────────┘  │  │  └────────────┘  │
│ │                  │  │                  │
│ │ ETH Missed:      │  │ ETH Missed:      │
│ │ 0.000567 ETH     │  │ 0.000089 ETH     │
│ │                  │  │                  │
│ │ Missed: 5/225    │  │ Missed: 1/225    │
│ │                  │  │                  │
│ │ ┌─────────────┐  │  │ ┌─────────────┐  │
│ │ │Source│Target│Head│ │ │Source│Target│Head│
│ │ │0.00 │ 0.00 │0.00│ │ │0.00 │ 0.00 │0.00│
│ │ └─────────────┘  │  │ └─────────────┘  │
│ └──────────────────┘  └──────────────────┘
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PERFORMANCE TREND CHART (Line Chart)                            │
│                                                                   │
│  100%  ┌─────────────────────────────────────────────────────   │
│        │╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲   ▬ Validator 1                      │
│  90%   │ ╱╲   ╱╲   ╱╲       ▬ Validator 2                      │
│        │  ╲ ╱  ╲ ╱  ╲ ╱     ▬ Validator 3                      │
│  80%   │   ╲╱    ╲╱         ▬ Validator 4                      │
│        │                    ▬ Validator 5                      │
│  70%   └─────────────────────────────────────────────────────   │
│        Epoch 180000      180056      180112      180168      180225
│                                                                   │
│        › 7-day moving average smoothing applied                  │
│        › Hover for exact values                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  MISSING EPOCH DATA                                           │
│ Missing data for epochs: 180045-180047, 180089. This data may   │
│ be available after the network stabilizes.                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ EPOCH-BY-EPOCH DETAILS                                          │
│                                                                   │
│ Filter: [Search by validator...    ]  Sort: [Epoch (Newest) ▼] │
│                                                                   │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │Epoch │Validator        │Status          │Source │Target │Head│ │
│ │      │                 │                │       │       │    │ │
│ │180225│123456           │✓ Correct       │  ✓    │  ✓    │ ✓  │ │
│ │180224│234567           │✗ Wrong Head    │  ✓    │  ✓    │ ✗  │ │
│ │180223│345678           │✓ Correct       │  ✓    │  ✓    │ ✓  │ │
│ │180222│456789           │✗ Missed        │  ✗    │  ✗    │ ✗  │ │
│ │180221│567890           │✓ Correct       │  ✓    │  ✓    │ ✓  │ │
│ │180220│123456           │✗ Wrong Target  │  ✓    │  ✗    │ ✓  │ │
│ │...                                                            │ │
│ └──────────────────────────────────────────────────────────────┘│
│                                                                   │
│ › Sortable by 4 different criteria                              │
│ › Filterable by validator index in real-time                   │
│ › Horizontal scroll on mobile devices                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ RECONCILIATION DATA                                             │
│                                                                   │
│ ℹ️ Data is reconciled against beaconcha.in to ensure accuracy.  │
│                                                                   │
│ ┌───────────────────┐  ┌───────────────────┐  ┌──────────────┐ │
│ │Validator 123456   │  │Validator 234567   │  │Validator ... │ │
│ │                   │  │                   │  │              │ │
│ │Dashboard: 0.00012 │  │Dashboard: 0.00023 │  │Dashboard:... │ │
│ │Beaconcha: 0.00012 │  │Beaconcha: 0.00024 │  │Beaconcha:... │ │
│ │Discrepancy: 0.44% │  │Discrepancy: 4.17% │  │Discrepancy:..│ │
│ │✓ Within tolerance │  │✓ Within tolerance │  │✓ Within ...  │ │
│ └───────────────────┘  └───────────────────┘  └──────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Ethereum Validator Dashboard • Powered by Beacon API            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Palette

### Primary Colors

- **Purple (#7c3aed)** - Main interactive elements, headers
- **Dark Purple (#6d28d9)** - Hover states, gradients
- **Light Purple (#a78bfa)** - Accent borders

### Secondary Colors

- **Cyan (#06b6d4)** - ETH values, secondary accents
- **Dark Cyan (#0891b2)** - Hover states for cyan

### Background & Text

- **Background (#0f172a)** - Main dark background
- **Surface (#1e293b)** - Card backgrounds
- **Surface Alt (#334155)** - Secondary backgrounds
- **Text Primary (#f1f5f9)** - Main text
- **Text Secondary (#cbd5e1)** - Secondary text
- **Text Muted (#94a3b8)** - Disabled/muted text

### Status Colors

- **Success Green (#10b981)** - Correct attestations
- **Warning Amber (#f59e0b)** - Missing data
- **Danger Red (#ef4444)** - Failed attestations

---

## Component Details

### Summary Card Layout

```
.validator-card
├── .validator-header
│   ├── .validator-title
│   │   ├── .validator-index (text: "Index: 123456")
│   │   └── .validator-key (text: "0x89ca...ba58")
│   └── .effectiveness-badge (text: "99.55%")
│
├── .validator-stats (2-column grid)
│   ├── .stat-item (Total ETH Missed)
│   ├── .stat-item (Missed Attestations)
│   ├── .stat-item (Source Misses)
│   ├── .stat-item (Target Misses)
│   └── .stat-item (Head Misses)
│
└── .component-breakdown
    ├── .component-bar.source
    ├── .component-bar.target
    └── .component-bar.head
```

### Chart Legend

```
▬ Validator 1: Purple (#7c3aed)
▬ Validator 2: Cyan (#06b6d4)
▬ Validator 3: Green (#10b981)
▬ Validator 4: Amber (#f59e0b)
▬ Validator 5: Red (#ef4444)
```

### Table Status Badges

| Badge          | Style            | Meaning                   |
| -------------- | ---------------- | ------------------------- |
| ✓ Correct      | Green background | All components correct    |
| ✗ Missed       | Gray background  | Entire attestation missed |
| ✗ Wrong Head   | Red background   | Head vote was wrong       |
| ✗ Wrong Target | Red background   | Target vote was wrong     |
| ✗ Wrong Source | Red background   | Source vote was wrong     |

### Flag Indicators

| Flag | Style | Meaning             |
| ---- | ----- | ------------------- |
| ✓    | Green | Component correct   |
| ✗    | Red   | Component incorrect |

---

## Responsive Behavior

### Desktop (> 768px)

- 3-column validator card grid
- Full-width table with 7 columns visible
- Chart height: 400px
- Side-by-side controls

### Tablet (480px - 768px)

- 2-column validator card grid
- Table with horizontal scroll
- Chart height: 350px
- Stacked controls

### Mobile (< 480px)

- 1-column validator card grid
- Table with horizontal scroll
- Chart height: 300px
- Full-width controls
- Larger touch targets
- Optimized spacing

---

## Animation & Transitions

### Hover Effects

- Card: 4px upward movement, border color change
- Button: Color gradient shift, shadow increase
- Table row: Subtle background color change
- Badge: Glow effect

### Loading Animation

```
.spinner {
    // Rotating border animation
    // Duration: 1s
    // Infinite loop
}
```

### Data Updates

- Fade-in effect: 300ms
- Slide animations: 300ms
- Color transitions: 300ms

---

## Accessibility Features

### Semantic HTML

- Proper heading hierarchy (h1, h2, h3)
- Form labels with explicit `for` attributes
- Button elements for interactive actions
- Table header cells (`<th>`)

### Color Contrast

- Text: 4.5:1 ratio (WCAG AA)
- Graphics: 3:1 ratio (WCAG AA)
- All badges have both color and text

### Keyboard Navigation

- Tab order follows visual flow
- Focus states clearly visible
- All buttons accessible via keyboard
- Enter to submit, Escape to cancel

### Screen Reader Support

- ARIA labels for icons
- Table headers associated with cells
- Error messages linked to inputs
- Loading state announced

---

## Print Stylesheet

When printing:

- Hide controls and footer
- Full page width for cards
- Remove shadows and animations
- Optimize for black & white
- Page breaks after sections

---

## Dark Mode Considerations

- ✓ Default dark theme (background #0f172a)
- ✓ Text contrast optimized for dark
- ✓ Icons designed for dark theme
- ✓ OLED-friendly design (blacks = off pixels)
- ✓ No harsh white backgrounds

---

## Browser Rendering

### Display Modes

- Standard: Full UI with all features
- Degraded: Graceful fallback for older browsers
  - Charts still render (Chart.js fallback)
  - Tables still functional
  - Styling degrades but usable

### Performance Metrics

- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 2s

---

## Future Theme Options

Design is extensible for additional themes:

- Light mode (light grays, dark text)
- High contrast mode (pure black/white)
- Colorblind-friendly palette
- Custom user themes via CSS variables

---

**UI/UX Design**: Modern, Dark-Themed, Fully Responsive ✨
