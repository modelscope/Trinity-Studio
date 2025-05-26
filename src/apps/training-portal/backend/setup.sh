#!/bin/bash

# 1. Install 'uv' if not available
if ! command -v uv &> /dev/null; then
    echo "'uv' is not installed. Installing with shell script..."
    curl -Ls https://astral.sh/uv/install.sh | sh
    if ! command -v uv &> /dev/null; then
        echo "Error: 'uv' installation failed. Please install it manually."
        exit 1
    fi
fi

# 2. Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# 3. Activate virtual environment and install requirements
source .venv/bin/activate

# Ensure pip is installed and up to date using uv
echo "Ensuring pip is installed and up to date with uv..."
uv pip install --upgrade pip

# Install package in development mode using uv (always)
echo "Installing package in development mode with uv..."
uv pip install -e .

# 4. Create necessary directories
mkdir -p configs
mkdir -p logs

# 5. Done
echo "Setup complete." 