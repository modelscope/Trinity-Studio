#!/bin/bash

# Activate virtual environment
source .venv/bin/activate

# Create logs directory if it doesn't exist
mkdir -p logs

# Get port from shared config
PORT=$(node -e "console.log(require('../../../configs/index').getBackendUrl('trainingPortal').split(':').pop())")

echo "Starting backend server with Waitress on port $PORT..."
waitress-serve --host=0.0.0.0 --port=$PORT app:app 