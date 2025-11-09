# Leak Types Card Layout Reorganization

## ✅ Update Complete

Reorganized the leak type cards to improve information hierarchy and visual flow by moving Key Characteristics to the left side and Acoustic Signature to the bottom right.

---

## Changes Made

### Layout Restructuring

#### Before:
```
┌─────────────────────────────────────────────────────────┐
│  [Leak Name]                     [97.5% Accuracy]       │
├──────────────────────┬──────────────────────────────────┤
│                      │  Key Characteristics             │
│  [Image]             │  → Point 1                       │
│                      │  → Point 2                       │
│  [Description]       │                                  │
│                      │  Time-Frequency Spectrogram      │
│                      │  [Heatmap]                       │
│                      │                                  │
│                      │  Frequency Power Spectrum        │
│                      │  [Chart]                         │
│                      │                                  │
│                      │  [▶ Play Sound]                  │
│                      │                                  │
│                      │  Acoustic Signature              │
│                      │  [2.5-4.0 kHz]                   │
└──────────────────────┴──────────────────────────────────┘
```

#### After:
```
┌─────────────────────────────────────────────────────────┐
│  [Leak Name]                     [97.5% Accuracy]       │
├──────────────────────┬──────────────────────────────────┤
│                      │  Time-Frequency Spectrogram      │
│  [Image]             │  [Heatmap]                       │
│                      │                                  │
│  [Description]       │  Frequency Power Spectrum        │
│                      │  [Chart]                         │
│  Key Characteristics │                                  │
│  → Point 1           │  [▶ Play Sound]                  │
│  → Point 2           │                                  │
│  → Point 3           │  Acoustic Signature              │
│  → Point 4           │  [2.5-4.0 kHz]                   │
└──────────────────────┴──────────────────────────────────┘
```

---

## Rationale

### 1. **Key Characteristics → Left Side**

**Why:**
- Key Characteristics are textual and complement the image/description
- Groups related descriptive content together on the left
- Makes the right side purely analytical/visual (spectrograms + audio)
- Better semantic organization: "What is it?" (left) vs "How do we detect it?" (right)

**Benefits:**
- Easier reading flow: image → description → characteristics
- Users can understand the leak type before diving into technical analysis
- More balanced visual weight between left and right columns

### 2. **Acoustic Signature → Bottom Right**

**Why:**
- Natural conclusion to the analytical flow on the right side
- Follows the signal processing pipeline: Time-Freq → Power Spectrum → Audio → Summary
- Play button leads naturally to the acoustic signature badge
- Creates a clear "listen → see summary" interaction pattern

**Benefits:**
- Better information hierarchy
- Play button and acoustic signature are now adjacent
- Users can play the sound and immediately see the frequency range
- Clear endpoint for the analytical section

---

## Technical Implementation

### JSX Changes (LeakTypes.jsx)

#### 1. Moved Key Characteristics to Left Section:
```jsx
<div className="leak-left-section">
  <div className="leak-image-container">
    <img src={leak.image} alt={leak.name} className="leak-image" />
  </div>
  <p className="leak-description">{leak.description}</p>

  {/* Key Characteristics - MOVED HERE */}
  <div className="leak-info-section">
    <h4>Key Characteristics</h4>
    <ul className="characteristics-list">
      {leak.characteristics.map((char, idx) => (
        <li key={idx}>{char}</li>
      ))}
    </ul>
  </div>
</div>
```

#### 2. Separated Audio Player from Acoustic Signature:
```jsx
<div className="leak-right-section">
  {/* ... spectrograms ... */}

  {/* Audio Player - SEPARATED */}
  <div className="audio-player-section">
    <div className="audio-player">
      <button className="play-button" onClick={() => handlePlayAudio(leak.id)}>
        {playingId === leak.id ? (
          <><Pause size={16} /> Playing...</>
        ) : (
          <><Play size={16} /> Play Sound</>
        )}
      </button>
    </div>
  </div>

  {/* Acoustic Signature - NOW AT BOTTOM */}
  <div className="leak-frequency">
    <h4>Acoustic Signature</h4>
    <div className="frequency-badge" style={{...}}>
      {leak.frequency}
    </div>
  </div>
</div>
```

### CSS Changes (LeakTypes.css)

#### 1. Updated Audio Player Section:
```css
/* Replaced audio-signature-section */
.audio-player-section {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}
```

#### 2. Enhanced Acoustic Signature Styling:
```css
/* Added background and border to make it stand out */
.leak-frequency {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #e2e8f0;
  text-align: center;
}
```

---

## Information Flow

### Left Column (Descriptive):
1. **Image**: Visual representation of the leak
2. **Description**: What is this leak type and how does it occur?
3. **Key Characteristics**: What are the defining features?

### Right Column (Analytical):
1. **Time-Frequency Spectrogram**: How does the signal look over time?
2. **Frequency Power Spectrum**: Which frequencies are dominant?
3. **Audio Player**: Listen to the acoustic signature
4. **Acoustic Signature Summary**: Frequency range summary

---

## Visual Improvements

### Before:
- ❌ Key Characteristics separated from descriptive content
- ❌ Acoustic Signature embedded in middle of audio section
- ❌ Less clear reading flow

### After:
- ✅ Key Characteristics grouped with image/description
- ✅ Acoustic Signature as clear conclusion
- ✅ Logical top-to-bottom flow in both columns
- ✅ Play button → Acoustic signature creates clear interaction

---

## Responsive Behavior

The layout maintains its reorganization across all screen sizes:

### Desktop (>1024px):
- Full side-by-side layout with new organization
- Left: Image + Description + Key Characteristics
- Right: Spectrograms + Audio + Acoustic Signature

### Tablet/Mobile (<1024px):
- Stacks vertically
- Order: Image → Description → Key Characteristics → Spectrograms → Audio → Acoustic Signature
- Maintains logical reading flow even when stacked

---

## User Experience Impact

### Information Discovery:
1. User sees the leak image
2. Reads what it is and why it occurs
3. Reviews key characteristics
4. Examines time-frequency patterns
5. Views frequency power spectrum
6. Plays audio sample
7. Sees acoustic signature summary

### Benefits:
- **Clearer mental model**: Understand what it is before analyzing how to detect it
- **Better context**: Characteristics inform the spectral patterns
- **Natural conclusion**: Acoustic signature provides a memorable summary
- **Improved scannability**: Related information is grouped together

---

## Files Modified

1. **webapp/src/pages/LeakTypes.jsx**
   - Moved Key Characteristics from right section to left section
   - Separated audio player from acoustic signature
   - Reordered right section components

2. **webapp/src/pages/LeakTypes.css**
   - Replaced `.audio-signature-section` with `.audio-player-section`
   - Enhanced `.leak-frequency` styling with background and border
   - Centered acoustic signature text

---

## Testing Checklist

- [x] Key Characteristics appears in left section (all 5 leak types)
- [x] Acoustic Signature appears at bottom of right section (all 5 types)
- [x] Play button works correctly
- [x] Spectrograms render properly
- [x] Layout responsive on mobile/tablet
- [x] Visual hierarchy is clear
- [x] All styling consistent across leak types

---

## Impact on All 5 Leak Types

This reorganization applies to all leak type cards:

1. ✅ **Circumferential Crack**
2. ✅ **Gasket Leak**
3. ✅ **Longitudinal Crack**
4. ✅ **No-leak (Baseline)**
5. ✅ **Orifice Leak**

Each card now follows the same improved information hierarchy.

---

**All 5 leak type cards now have a clearer, more logical layout!** 📋✨

Date: November 8, 2024
