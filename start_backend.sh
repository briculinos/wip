#!/bin/bash

echo "Starting LucentWave Backend..."
echo "================================"

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install dependencies
echo "Activating virtual environment..."
source backend/venv/bin/activate

# Install requirements if needed
echo "Installing dependencies..."
pip install -q -r backend/requirements.txt

# Start the backend server
echo "Starting FastAPI server on http://localhost:8000"
echo "================================"
cd backend
python app.py
