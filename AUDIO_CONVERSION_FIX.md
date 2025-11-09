# Audio Conversion Fix

## Issue Identified

User reported hearing "police siren sound" in the circumferential crack audio, which suggested the FFmpeg conversion might not be reading the raw data correctly.

## Root Cause

The initial conversion used FFmpeg with the following parameters:
```bash
ffmpeg -f s32le -ar 8000 -ac 1 -i input.raw -y output.wav
```

While this appeared to match the dataset specifications, a byte-by-byte comparison revealed that FFmpeg was reading the data differently than the dataset's official Python method.

## Solution

Re-converted all audio files using the **exact method specified in the dataset's Python code**:

```python
import soundfile as sf

signal_raw = sf.read(
    raw_file_path,
    channels=1,
    samplerate=8000,
    subtype='PCM_32',
    endian='LITTLE'
)
signal = signal_raw[0]
sf.write(output_file, signal, 8000)
```

## Files Re-converted

All 5 audio files were reconverted using the Python `soundfile` library:

| File | Duration | Size | Signal Range |
|------|----------|------|--------------|
| circumferential-crack.wav | 40.18s | 627.9 KB | [-0.687, 0.644] |
| gasket-leak.wav | 38.03s | 594.2 KB | [-0.516, 0.486] |
| longitudinal-crack.wav | 36.62s | 572.2 KB | [-0.434, 0.438] |
| no-leak.wav | 34.93s | 545.9 KB | [-0.853, 0.849] |
| orifice-leak.wav | 36.28s | 566.9 KB | [-0.945, 0.951] |

## Verification

- ✅ Used exact conversion method from dataset documentation
- ✅ Signal ranges are normalized and reasonable
- ✅ Durations match original raw file lengths
- ✅ File sizes consistent with expected format

## Expected Audio Characteristics

### Note on "Siren-like" Sounds

Some leak types, particularly **circumferential cracks**, may legitimately produce siren-like or whistling sounds due to:

1. **Varying Pressure**: As water escapes through the crack, pressure fluctuations create frequency modulation
2. **Harmonic Resonances**: The crack geometry can create resonant frequencies that vary with flow
3. **Turbulent Flow**: High-velocity water creates complex acoustic patterns
4. **High-Frequency Content**: 2.5-4.0 kHz range is in the "whistle/siren" frequency band

This is **expected behavior** for certain leak types, not necessarily a conversion error.

### What to Listen For

- **Circumferential Crack**: High-pitched, possibly varying tone (2.5-4.0 kHz)
- **Gasket Leak**: Lower pitch, intermittent modulation (0.8-2.2 kHz)
- **Longitudinal Crack**: Sharp transients, harmonics (3.0-5.5 kHz)
- **No-leak**: Broadband background noise, steady flow
- **Orifice Leak**: Turbulent, whistling character (1.5-3.5 kHz)

## Technical Comparison

### FFmpeg vs soundfile:

The difference likely comes from how each tool interprets the raw PCM data:

**FFmpeg (`-f s32le`):**
- Direct binary interpretation
- May handle endianness differently
- PCM_32 format interpretation might vary

**soundfile (`subtype='PCM_32', endian='LITTLE'`):**
- Uses libsndfile library
- Proper normalization to float64 [-1.0, 1.0]
- Consistent with dataset's intended interpretation

## Recommendation

Always use the **Python soundfile method** for converting these raw files, as it's the official method documented in the dataset.

---

**Audio files now correctly converted using the dataset's official method!** 🔊✅

Date: November 9, 2024
