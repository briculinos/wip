# Time-Frequency Heatmap Axis Labels Fix

## ✅ Fix Complete

Fixed the axis label alignment for the time-frequency spectrogram heatmap. The frequency and time labels now properly align with the heatmap grid.

---

## Issue

The previous implementation had misaligned axis labels:
- Frequency labels (0, 2, 4, 6, 8 kHz) were not aligned with the heatmap rows
- Time labels (0, 0.5, 1.0, 1.5, 2.0 s) were not aligned with the heatmap columns
- Labels appeared disconnected from the grid

---

## Solution

Redesigned the heatmap component structure with proper CSS layout:

### New Component Structure:

```
tf-heatmap-wrapper
├── tf-main-container
│   ├── tf-ylabel (vertical "Frequency (kHz)")
│   └── tf-grid-container
│       ├── tf-freq-axis (5 labels: 8, 6, 4, 2, 0)
│       └── tf-heatmap-grid (64×40 cells)
└── tf-time-axis-container
    ├── tf-time-axis (5 labels: 0.0, 0.5, 1.0, 1.5, 2.0)
    └── tf-xlabel ("Time (seconds)")
```

### Layout Strategy:

1. **Flexbox Layout**: Used CSS Flexbox for proper alignment
2. **Frequency Axis**:
   - Uses `justify-content: space-between` to evenly distribute labels
   - Labels span from top (8 kHz) to bottom (0 kHz)
   - Right-aligned text for clean appearance
3. **Time Axis**:
   - Uses `justify-content: space-between` to evenly distribute labels
   - Labels span from left (0.0s) to right (2.0s)
   - Proper margin-left to align with the grid
4. **Grid**:
   - Uses `flex-direction: column-reverse` to place 0 kHz at bottom
   - Each row uses `flex: 1` to fill available space equally

---

## Key CSS Changes

### Before (Problematic):
```css
.tf-heatmap-container {
  /* Labels were separate from grid */
  /* No proper alignment mechanism */
}

.tf-axis-labels {
  /* Labels positioned after grid */
  /* Hard to maintain alignment */
}
```

### After (Fixed):
```css
/* Main container aligns Y-label and grid side-by-side */
.tf-main-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Frequency axis aligned with grid rows */
.tf-freq-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Evenly distributed */
  text-align: right;
}

/* Grid container keeps axis and grid together */
.tf-grid-container {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  align-items: stretch; /* Equal height */
}

/* Time axis aligned with grid columns */
.tf-time-axis {
  width: 100%;
  display: flex;
  justify-content: space-between; /* Evenly distributed */
}

/* Proper margin to align with grid */
.tf-time-axis-container {
  margin-left: 2.5rem; /* Accounts for Y-label + freq-axis width */
}
```

---

## Visual Alignment

### Frequency Axis (Vertical):
```
8  ┌─────────────────────┐  ← 8 kHz (top of grid)
   │                     │
6  │    Heatmap Grid     │  ← 6 kHz
   │                     │
4  │     (64 rows)       │  ← 4 kHz
   │                     │
2  │                     │  ← 2 kHz
   │                     │
0  └─────────────────────┘  ← 0 kHz (bottom of grid)
```

### Time Axis (Horizontal):
```
   ┌─────┬─────┬─────┬─────┬─────┐
   │     │     │     │     │     │
   │  Heatmap Grid (40 columns)  │
   │     │     │     │     │     │
   └─────┴─────┴─────┴─────┴─────┘
   ↑     ↑     ↑     ↑     ↑
  0.0   0.5   1.0   1.5   2.0  (seconds)
```

---

## Responsive Design

### Desktop (>768px):
- Full-size heatmap (200px height)
- Standard font sizes (0.7-0.8rem)
- Comfortable spacing

### Mobile (<768px):
- Reduced heatmap height (150px)
- Smaller fonts (0.65rem)
- Tighter spacing
- Adjusted margins for smaller screens

---

## Files Modified

1. **webapp/src/pages/LeakTypes.jsx**
   - Restructured `TimeFrequencyHeatmap` component
   - New JSX hierarchy with proper nesting
   - Removed old label structure

2. **webapp/src/pages/LeakTypes.css**
   - Replaced `.tf-heatmap-container` with `.tf-heatmap-wrapper`
   - Added `.tf-main-container` for layout
   - Added `.tf-grid-container` to group axis and grid
   - Updated `.tf-freq-axis` with flexbox alignment
   - Updated `.tf-time-axis` with flexbox alignment
   - Added responsive styles for mobile

---

## Testing Checklist

- [x] Frequency labels align with heatmap rows
- [x] Time labels align with heatmap columns
- [x] Labels evenly distributed (space-between)
- [x] Y-axis label displays vertically
- [x] X-axis label displays horizontally
- [x] Grid maintains proper aspect ratio
- [x] Hover tooltips still work
- [x] Responsive on mobile devices
- [x] All 5 leak types render correctly

---

## Technical Details

### Alignment Mechanism:

The key to proper alignment is using `justify-content: space-between` on both axes:

```css
/* Frequency axis */
.tf-freq-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 5 labels evenly distributed */
}

/* Time axis */
.tf-time-axis {
  display: flex;
  justify-content: space-between; /* 5 labels evenly distributed */
}
```

This ensures that:
- First label aligns with first row/column
- Last label aligns with last row/column
- Middle labels distribute evenly

### Grid Structure:

```css
.tf-heatmap-grid {
  display: flex;
  flex-direction: column-reverse; /* 0 kHz at bottom */
}

.tf-row {
  display: flex;
  flex: 1; /* Equal height rows */
}

.tf-cell {
  flex: 1; /* Equal width cells */
}
```

This creates a perfectly uniform grid where each cell is the same size.

---

## Comparison

### Before:
- ❌ Labels floating independently
- ❌ Difficult to read exact frequencies/times
- ❌ Visual disconnect between labels and grid
- ❌ Hard to maintain with CSS changes

### After:
- ✅ Labels tightly coupled to grid
- ✅ Clear alignment with rows/columns
- ✅ Professional scientific visualization
- ✅ Easy to maintain and modify

---

## Future Improvements

- [ ] Add intermediate tick marks (e.g., 1, 3, 5, 7 kHz)
- [ ] Add grid lines at label positions
- [ ] Make axis labels clickable for filtering
- [ ] Add zoom functionality
- [ ] Export heatmap as PNG with labels

---

**The heatmap now has properly aligned, professional-grade axis labels!** 📊✅

Date: November 8, 2024
