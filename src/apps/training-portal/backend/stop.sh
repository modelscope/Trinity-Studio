#!/bin/bash

# Find and kill the Waitress server running on port 3004
PID=$(lsof -ti:3004 -sTCP:LISTEN -a -c waitress-serve)

if [ -z "$PID" ]; then
    echo "No Waitress server running on port 3004 found."
else
    echo "Stopping Waitress server (PID: $PID) on port 3004..."
    kill $PID
    echo "Waitress server stopped."
fi 