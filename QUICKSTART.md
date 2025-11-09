# Quick Start Guide - LucentWave

Get your LucentWave demo up and running in 5 minutes!

## Prerequisites

Make sure you have:
- ✅ Node.js 18+ and npm
- ✅ Python 3.9+
- ✅ Terminal/Command Line

## Option 1: Automated Startup (Recommended)

### On macOS/Linux:

**Terminal 1 - Backend:**
```bash
./start_backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start_frontend.sh
```

### On Windows:

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd webapp
npm install
npm run dev
```

## Option 2: Manual Setup

### Step 1: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

Backend will be running at: **http://localhost:8000**

### Step 2: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to webapp folder
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be running at: **http://localhost:5173**

## Access the Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. Explore the demo!

## Quick Tour

### 1. Pipeline Page (Home)
- See the complete data flow from raw audio to leak classification
- Understand how Hyperlet transform windowing improves detection

### 2. Leak Types
- Browse all 5 leak types with images
- Learn about acoustic signatures for each leak
- View detection accuracy metrics

### 3. Live Demo
- Click "Run Demo Analysis" for instant results
- Upload your own audio files (future feature)
- See real-time classification with confidence scores

## Troubleshooting

### Backend won't start?

**Error: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
cd backend
pip install -r requirements.txt
```

**Error: Port 8000 already in use**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
```

### Frontend won't start?

**Error: `npm: command not found`**
- Install Node.js from https://nodejs.org/

**Error: Port 5173 already in use**
```bash
# The Vite dev server will automatically try port 5174
# Or kill the process:
lsof -ti:5173 | xargs kill -9
```

### Images not showing?

```bash
# Make sure images are in the right place
ls webapp/public/Images/
# Should show: Circumferential Crack.jpg, Gasket Leak.jpg, etc.
```

### CORS errors?

Make sure:
1. Backend is running on port 8000
2. Frontend is running on port 5173
3. Both servers are started

## Running the Window Comparison Script

To see detailed HLT vs FFT comparison:

```bash
cd code
python window_comparison.py
```

This generates:
- Console output with performance metrics
- `window_comparison.png` with visualization charts

## Training Your Own Model

To train the recommended model (v4):

```bash
cd code
python hydrophone_leak_cnn_4.py
```

⚠️ **Note:** This requires the preprocessed data files:
- `data/pilotLeakX.npy`
- `data/pilotLeakY.npy`

To generate these files from raw data, run:
```bash
cd code
julia pilot.jl
```

## What's Next?

- 🎯 Try the demo analysis
- 📖 Read the full README.md for technical details
- 🔧 Train your own model with custom data
- 🚀 Deploy to production (Docker support coming soon)

## Performance Metrics

Once running, you should see:

| Metric | Value |
|--------|-------|
| Backend Startup Time | ~3-5 seconds |
| Frontend Startup Time | ~2-3 seconds |
| Demo Analysis Time | ~1-2 seconds |
| Model Accuracy | 97.5% average |

## Need Help?

- Check the main README.md for detailed documentation
- Review API docs at http://localhost:8000/docs
- Inspect browser console for frontend errors
- Check terminal output for backend errors

## Success Indicators

✅ Backend shows: "Uvicorn running on http://0.0.0.0:8000"
✅ Frontend shows: "Local: http://localhost:5173/"
✅ Browser opens to a colorful gradient header
✅ Navigation bar shows: Pipeline, Leak Types, Live Demo
✅ Demo page allows "Run Demo Analysis"

---

**You're all set! Enjoy exploring LucentWave!** 🎉
