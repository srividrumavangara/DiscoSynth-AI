#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Ensure local mongodb data directory exists
mkdir -p "$DIR/mongodb_data"

# Check if mongod is already running on port 27017
if ! lsof -i :27017 >/dev/null 2>&1; then
    echo "Starting local MongoDB daemon..."
    mongod --dbpath "$DIR/mongodb_data" --port 27017 --logpath "$DIR/mongodb_data/mongod.log" &
    sleep 2
    echo "MongoDB started."
else
    echo "MongoDB is already running on port 27017."
fi

# Run backend with uvicorn
echo "Activating virtual environment and starting FastAPI server on port 8000..."
source "$DIR/backend/venv/bin/activate"
cd "$DIR/backend"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
