# Models Directory

This directory is for storing trained model files.

## Model Files

Place your trained model here:
- `leak_detector.h5` - Trained CNN model for leak detection

## Training a Model

To train the recommended model:

```bash
cd ../code
python hydrophone_leak_cnn_4.py
```

After training completes, copy the saved model here:

```bash
cp path/to/trained/model.h5 backend/models/leak_detector.h5
```

## Model Format

The backend expects:
- **Format**: Keras HDF5 (.h5)
- **Input Shape**: (512, 969, 2) - (freq_bins, time_frames, channels)
- **Output Shape**: (5,) - probabilities for 5 leak types
- **Classes**: [Circumferential Crack, Gasket Leak, Longitudinal Crack, No-leak, Orifice Leak]

## Demo Mode

If no trained model is found, the backend will:
1. Build the model architecture
2. Initialize with random weights (not trained)
3. Still allow demo functionality
4. Return predictions (but they won't be accurate)

For production use, you **must** train and save a proper model.
