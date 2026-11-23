#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/frontend"

echo "Starting DiscoSynth AI Frontend (Vite) on http://localhost:5173..."
exec npm run dev
