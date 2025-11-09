#!/bin/bash

echo "Starting LucentWave Frontend..."
echo "================================"

cd webapp

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

echo "Starting React development server on http://localhost:5173"
echo "================================"
npm run dev
