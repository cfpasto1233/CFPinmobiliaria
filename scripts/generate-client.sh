#!/usr/bin/env bash
set -e

BACKEND_URL="${1:-http://localhost:8000}"
OPENAPI_URL="$BACKEND_URL/api/v1/openapi.json"

echo "Waiting for backend at $OPENAPI_URL..."
for i in $(seq 1 30); do
    if curl -sf "$OPENAPI_URL" > /dev/null 2>&1; then
        echo "Backend ready."
        break
    fi
    echo "Attempt $i/30 — retrying in 2s..."
    sleep 2
done

echo "Generating HTTP client..."
cd frontend
npm run generate:client
echo "Client generated at frontend/src/client/"
